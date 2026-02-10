const mongoose = require('mongoose');

const subCategorySchema = new mongoose.Schema({
    category_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    subcategory_name: {
        type: String,
        required: true
    },
    image_url: {
        type: String
    }
});

subCategorySchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        delete ret._id;
    }
});

module.exports = mongoose.model('SubCategory', subCategorySchema);
