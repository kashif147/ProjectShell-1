// Save or update a draft
register("save-garda-draft", async (data) => {
  let draftsStr = await sharedStorage.get("gardaApplicationDrafts");
  let drafts = draftsStr ? JSON.parse(draftsStr) : [];

  const existingIndex = drafts.findIndex(d => d.ApplicationId === data.ApplicationId);
  if (existingIndex >= 0) {
    drafts[existingIndex] = data;
  } else {
    drafts.push(data);
  }

  await sharedStorage.set("gardaApplicationDrafts", JSON.stringify(drafts));
});

// Get all drafts
register("get-garda-drafts", async () => {
  let draftsStr = await sharedStorage.get("gardaApplicationDrafts");
  return draftsStr ? JSON.parse(draftsStr) : [];
});

// Delete a draft
register("delete-garda-draft", async (data) => {
  let draftsStr = await sharedStorage.get("gardaApplicationDrafts");
  let drafts = draftsStr ? JSON.parse(draftsStr) : [];

  drafts = drafts.filter(d => d.ApplicationId !== data.ApplicationId);
  await sharedStorage.set("gardaApplicationDrafts", JSON.stringify(drafts));
});
