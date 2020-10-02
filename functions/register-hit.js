const faunadb = require("faunadb");

exports.handler = async (event) => {
  const q = faunadb.query;
  const client = new faunadb.Client({
    secret: process.env.FAUNA_SECRET_KEY,
  });

  const { type } = event.queryStringParameters;
  if (!type) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "Download type not provided",
      }),
    };
  }

  // Check and see if the doc exists.
  const doesDocExist = await client.query(
    q.Exists(q.Match(q.Index("downloads_by_type"), type))
  );
  if (!doesDocExist) {
    await client.query(
      q.Create(q.Collection("downloads"), {
        data: { type: type, downloads: 0 },
      })
    );
  }

  // Fetch the document for-real
  const document = await client.query(
    q.Get(q.Match(q.Index("downloads_by_type"), type))
  );

  await client.query(
    q.Update(document.ref, {
      data: {
        downloads: document.data.downloads + 1,
      },
    })
  );

  return {
    statusCode: 200,
    body: JSON.stringify({
      downloads: document.data.downloads,
    }),
  };
};
