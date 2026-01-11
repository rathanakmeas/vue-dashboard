export const buildSearchFilter = (searchQuery, fields = ['name']) => {
  if (!searchQuery || !searchQuery.trim()) {
    return {};
  }
  
  const escapedQuery = searchQuery.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(escapedQuery, 'i');
  
  return {
    $or: fields.map(field => ({ [field]: regex }))
  };
};

export const applySearch = (query, req, fields = ['name']) => {
  const searchQuery = req.query.search || req.body.search;
  const searchFilter = buildSearchFilter(searchQuery, fields);
  
  return { ...query, ...searchFilter };
};
