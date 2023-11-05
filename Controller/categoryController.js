const Category = require('../Model/categoryModel')
const factory = require('./factoryHandler');

exports.getCategory = factory.getAllOrOne(Category);
exports.createCategory = factory.creatNewOne(Category);
exports.updateCategory = factory.update(Category);
exports.deleteCategory = factory.delete(Category);

