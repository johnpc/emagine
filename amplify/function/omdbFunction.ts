import { LambdaFunctionURLEvent } from "aws-lambda";

const { OMDB_API_KEY } = process.env;
import Omdb from "omdbapi";

const search = async (title: string, year: number) => {
  const omdb = new Omdb(OMDB_API_KEY);

  const response = await omdb.search({
    search: title,
    type: "movie",
    year: year,
    page: "1",
  });
  console.log({
    response,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const match = Object.values(response).find((m: any) => m.imdbid);
  console.log({ match });
  if (!match) {
    return null;
  }

  const details = await omdb.get({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    id: (match as any).imdbid,
  });

  console.log({ details });

  return details;
};

export const handler = async (event: LambdaFunctionURLEvent) => {
  console.log({ event });
  const bodyJson = JSON.parse(event.body ?? "{}");
  console.log({ bodyJson });
  const title = bodyJson.title;
  const year = bodyJson.year;

  const omdbInfo = await search(title, year);

  return {
    statusCode: 200,
    body: JSON.stringify({
      omdbInfo,
      message: "success!",
    }),
  };
};
