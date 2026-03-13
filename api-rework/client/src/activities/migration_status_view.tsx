type MigrationStatus = {
  activity_id: string;
  timestamp: string;
  success: boolean;
  detail: { reason: string; extended_status: string }[];
};

const MigrationStatusView: React.FC<{ migrationStatus: MigrationStatus; rerunImport: () => void }> = ({
  migrationStatus,
  rerunImport
}) => {
  return (
    <>
      <button
        onClick={() => {
          rerunImport();
        }}
      >
        Rerun Import
      </button>
      <dl>
        <dt>Activity</dt>
        <dd>{migrationStatus.activity_id}</dd>
        <dt>Migration Timestamp</dt>
        <dd>{migrationStatus.timestamp}</dd>
        <dt>Migration Successful?</dt>
        <dd>{migrationStatus.success ? 'Yes' : 'No'}</dd>
        <dt>Remarks</dt>
        {migrationStatus.detail.map((d) => (
          <dd key={d.extended_status}>
            <strong>{d.reason}</strong> - {d.extended_status}
          </dd>
        ))}
      </dl>
    </>
  );
};

export default MigrationStatusView;
