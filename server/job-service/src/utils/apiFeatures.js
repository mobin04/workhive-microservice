class APIFeatures {
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
    const sortBy = this.query.sort || 'createdAt';
    const sortOrder = this.query.order === 'asc' ? 1 : -1;
    this.sorting = { [sortBy]: sortOrder };
    return this;
  }

  filter() {
    const excludedFields = ['page', 'limit', 'sort', 'order', 'search'];
    const filters = { ...this.query };
    excludedFields.forEach((field) => delete filters[field]);

    if (filters.salaryMinPerMonth) {
      filters.salaryMinPerMonth = { $gte: parseInt(filters.salaryMinPerMonth) };
    }
    if (filters.salaryMaxPerMonth) {
      filters.salaryMaxPerMonth = { $lte: parseInt(filters.salaryMaxPerMonth) };
    }
    if (filters.category) {
      filters.category = { $in: filters.category.split(',') };
    }
    if (filters.jobType) {
      filters.jobType = { $in: filters.jobType.split(',') };
    }
    if (filters.jobLevel) {
      filters.jobLevel = { $in: filters.jobLevel.split(',') };
    }
    if (
      filters.latitude &&
      filters.longitude &&
      filters.distance &&
      filters.unit
    ) {
      const { latitude, longitude, distance, unit } = filters;
      const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
      filters.geoLocation = {
        $geoWithin: {
          $centerSphere: [
            [parseFloat(longitude), parseFloat(latitude)],
            radius,
          ],
        },
      };
      delete filters.latitude;
      delete filters.longitude;
      delete filters.distance;
      delete filters.unit;
    }

    const finalFilter = { ...filters };

    if (this.query.search) {
      const searchRegex = new RegExp(this.query.search, 'i');
      finalFilter.$or = [
        { title: searchRegex },
        { company: searchRegex },
        { location: searchRegex },
        { name: searchRegex },
        { email: searchRegex },
        { role: searchRegex },
      ];
    }

    this.filters = finalFilter;
    return this;
  }

  async fetchJobs() {
    return await this.model
      .find(this.filters)
      .sort(this.sorting)
      .skip(this.pagination.skip)
      .limit(this.pagination.limit)
      .select('-applications')
      .lean();
  }
}

module.exports = APIFeatures;
