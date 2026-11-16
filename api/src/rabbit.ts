import { randomUUID } from 'crypto';
import amqp, { ConfirmChannel, ChannelModel } from 'amqplib';

const url = 'amqp://guest:guest@127.0.0.1:5672?frameMax=131072';
const QUEUE = 'node_tasks';

let connPromise: Promise<ChannelModel> | null = null;
let chPromise: Promise<ConfirmChannel> | null = null;

const getChannel = () => {
  if (!chPromise) {
    connPromise = amqp.connect(url);
    chPromise = connPromise
      .then(async (conn) => {
        conn.on('error', (e) => console.error('amqp conn error', e));
        conn.on('close', () => {
          connPromise = null;
          chPromise = null;
        });
        return conn.createConfirmChannel();
      })
      .catch((e) => {
        connPromise = null;
        chPromise = null;
        throw e;
      });
  }
  return chPromise;
};

export async function publishPriorityTask(taskName: string, args: unknown[] = [], kwargs: object = {}, priority = 9) {
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
