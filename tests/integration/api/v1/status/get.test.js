test("GET to /api/v1/status returns 200", async () => {
  const response = await fetch("http://localhost:3001/api/v1/status");
  expect(response.status).toBe(200);
  expect(response.statusText).toBe("OK");
});
