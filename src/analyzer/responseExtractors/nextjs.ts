//export function extractNextJsResponses(
//  added: string[],
//  removed: string[]
//) {
//  return {
//    added: added.filter(
//      (line) =>
//        line.includes("Response.json({") ||
//        line.includes("NextResponse.json({")
//    ),
//    removed: removed.filter(
//      (line) =>
//        line.includes("Response.json({") ||
//        line.includes("NextResponse.json({")
//    ),
//  };
//}

export function hasNextJsResponse(patch?: string): boolean {
  if (!patch) return false;

  return (
    patch.includes("Response.json(") ||
    patch.includes("NextResponse.json(")
  );
}

