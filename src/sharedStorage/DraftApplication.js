class GetDraftCountOperation {
  async run() {
    const drafts = await sharedStorage.get("gardaApplicationDrafts");
    const parsed = drafts ? JSON.parse(drafts) : [];
    console.log("Draft count inside worklet:", parsed.length);

    // ⚠ Can't just return drafts to the page
    return parsed.length; 
  }
}
register("getDraftApplication", GetDraftCountOperation);
