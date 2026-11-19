import { randomUUID } from 'node:crypto';
import amqp, { ConfirmChannel } from 'amqplib';

/*
  Celery Priority Task handler for Node. 
  used amqp to send tasks over celery-node, as c-n and django would conflict for the right to create a queue.
  leading to conflicts from the end that did not create it.
 */

const url = process.env.CELERY_BROKER_URL ?? 'unset';
const QUEUE = 'node_tasks';

enum CeleryTasks {
  ETL_BATCH = 'node_tasks.normalize_batch',
  ETL_ACTIVITY = 'node_tasks.normalize_legacy_record',
  ETL_USER = 'node_tasks.etl_updated_user'
}

let channel: ConfirmChannel | null = null;

const getChannel = async (): Promise<ConfirmChannel> => {
  if (!channel) {
    await amqp
      .connect(url)
      .then(async (conn) => {
        channel = await conn.createConfirmChannel();
        conn.on('error', (e) => console.error(e));
        conn.on('close', () => {
          channel = null;
        });
      })
      .catch((e) => {
        channel = null;
        throw e;
      });
  }
  return channel;
};

export async function publishPriorityTask(
  taskName: `${CeleryTasks}`,
  args: unknown[] = [],
  kwargs: object = {},
  priority = 9
) {
  const ch = await getChannel();
  const taskId = randomUUID();
  const body = Buffer.from(
    JSON.stringify([args, kwargs, { callbacks: null, errbacks: null, chain: null, chord: null }])
  );

  await new Promise<void>((resolve, reject) => {
    ch.sendToQueue(
      QUEUE,
      body,
      {
        contentType: 'application/json',
        contentEncoding: 'utf-8',
        correlationId: taskId,
        persistent: true,
        priority,
        headers: { lang: 'js', task: taskName, id: taskId, root_id: taskId, parent_id: null, group: null, retries: 0 }
      },
      (err) => (err ? reject(err) : resolve())
    );
  });

  return taskId;
}
