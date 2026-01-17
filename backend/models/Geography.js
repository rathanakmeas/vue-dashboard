import mongoose from 'mongoose';

const geographySchema = new mongoose.Schema({
  province_code: { type: String, required: true, index: true },
  province_kh: { type: String, required: true },
  province_en: { type: String, required: true },
  district_code: { type: String, required: true, index: true },
  district_kh: { type: String, required: true },
  district_en: { type: String, required: true },
  commune_code: { type: String, required: true, index: true },
  commune_kh: { type: String, required: true },
  commune_en: { type: String, required: true },
  village_code: { type: String, required: true, index: true, unique: true },
  village_kh: { type: String, required: true },
  village_en: { type: String, required: true }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
geographySchema.index({ province_code: 1, district_code: 1 });
geographySchema.index({ province_code: 1, district_code: 1, commune_code: 1 });

const Geography = mongoose.model('Geography', geographySchema);

export default Geography;
