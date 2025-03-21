import { escapeLiteral } from 'pg';

function escapeLiteralUnquoted(literal: string) {
  return escapeLiteral(literal).replaceAll(/^('|\s+E')|'$/g, '');
}

export { escapeLiteralUnquoted };
