export function DocsMethod({ method }) {
  return (
    <div>
      <header>
        <div>{method.path}</div>
        <div>Icon collapse</div>
      </header>
      <main>
        <div>Request body</div>
        <div>Execute button (enabled when all fields required were filled)</div>
        <div>Possible Responses</div>
        <div>actual Response</div>
      </main>
    </div>
  );
}
