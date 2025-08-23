class UserAPIFeatures {
  constructor(model, query) {
    this.model = model;
    this.query = query;
  }

  paginate() {
    const page = parseInt(this.query.page) || 1;
    const limit = parseInt(this.query.limit) || 10;
    const skip = (page - 1) * limit;
    this.pagination = { skip, limit };
    return this;
  }

  sort() {
    const sortBy = this.query.sort || "createdAt";
    const sortOrder = this.query.order === "asc" ? 1 : -1;
    this.sorting = { [sortBy]: sortOrder };
    return this;
  }

  filter() {
    // remove pagination/sort/search from filters
    const excludedFields = ["page", "limit", "sort", "order", "search"];
    const filters = { ...this.query };
    excludedFields.forEach((field) => delete filters[field]);

    this.filters = filters;
    return this;
  }

  search() {
    if (this.query.search) {
      const searchRegex = new RegExp(this.query.search, "i"); // case-insensitive
      this.filters = {
        ...this.filters,
        $or: [
          { name: searchRegex },
          { email: searchRegex },
          { role: searchRegex },
        ],
      };
    }
    return this;
  }

  async fetchUsers() {
    return await this.model
      .find(this.filters)
      .sort(this.sorting)
      .skip(this.pagination.skip)
      .limit(this.pagination.limit)
      .select("-password")
      .lean();
  }
}

module.exports = UserAPIFeatures;