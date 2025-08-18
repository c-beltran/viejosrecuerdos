const createItem = async (itemData, userId) => {
  try {
    const newItem = {
      ...itemData,
      lastModifiedBy: userId,
      createDate: new Date().toISOString(),
      updatedDate: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from("inventory")
      .insert([newItem])
      .select()
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    // Map database column names to frontend expected names
    const mappedItem = {
      ...data,
      createdAt: data.createDate,
      updatedAt: data.updatedDate
    };

    return mappedItem;
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};
