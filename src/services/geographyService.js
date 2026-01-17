/**
 * Cambodia Geography Service
 * Fetches and manages hierarchical geographical data from backend database
 */

const API_BASE_URL = 'http://localhost:5001/api/geography/data';
const CACHE_KEY = 'cambodia_geography_data';
const CACHE_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

class GeographyService {
  constructor() {
    this.data = null;
    this.hierarchicalData = null;
  }

  /**
   * Fetch all geographical data from API
   */
  async fetchAllData() {
    try {
      // Check cache first
      const cached = this.getFromCache();
      if (cached) {
        this.data = cached;
        return cached;
      }

      console.log('Fetching geographical data from backend database...');
      
      const response = await fetch(API_BASE_URL);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }

      const result = await response.json();
      const allData = result.items || [];
      
      console.log(`Loaded ${allData.length} geographical records (source: ${result.source})`);
      
      // Save to cache
      this.saveToCache(allData);
      this.data = allData;
      
      return allData;
    } catch (error) {
      console.error('Error fetching geographical data:', error);
      throw error;
    }
  }

  /**
   * Build hierarchical structure from flat data
   */
  async getHierarchicalData() {
    if (this.hierarchicalData) {
      return this.hierarchicalData;
    }

    if (!this.data) {
      await this.fetchAllData();
    }

    const hierarchy = {};

    this.data.forEach(item => {
      const provCode = item.province_code;
      const distCode = item.district_code;
      const commCode = item.commune_code;
      const villCode = item.village_code;

      // Initialize province
      if (!hierarchy[provCode]) {
        hierarchy[provCode] = {
          code: provCode,
          name_kh: item.province_kh,
          name_en: item.province_en,
          districts: {}
        };
      }

      // Initialize district
      if (!hierarchy[provCode].districts[distCode]) {
        hierarchy[provCode].districts[distCode] = {
          code: distCode,
          name_kh: item.district_kh,
          name_en: item.district_en,
          communes: {}
        };
      }

      // Initialize commune
      if (!hierarchy[provCode].districts[distCode].communes[commCode]) {
        hierarchy[provCode].districts[distCode].communes[commCode] = {
          code: commCode,
          name_kh: item.commune_kh,
          name_en: item.commune_en,
          villages: {}
        };
      }

      // Add village
      if (villCode && !hierarchy[provCode].districts[distCode].communes[commCode].villages[villCode]) {
        hierarchy[provCode].districts[distCode].communes[commCode].villages[villCode] = {
          code: villCode,
          name_kh: item.village_kh,
          name_en: item.village_en
        };
      }
    });

    this.hierarchicalData = hierarchy;
    return hierarchy;
  }

  /**
   * Get list of all provinces
   */
  async getProvinces() {
    const hierarchy = await this.getHierarchicalData();
    return Object.values(hierarchy).map(p => ({
      code: p.code,
      name_kh: p.name_kh,
      name_en: p.name_en
    })).sort((a, b) => a.code.localeCompare(b.code));
  }

  /**
   * Get districts for a specific province
   */
  async getDistricts(provinceCode) {
    if (!provinceCode) return [];
    
    const hierarchy = await this.getHierarchicalData();
    const province = hierarchy[provinceCode];
    
    if (!province) return [];

    return Object.values(province.districts).map(d => ({
      code: d.code,
      name_kh: d.name_kh,
      name_en: d.name_en
    })).sort((a, b) => a.code.localeCompare(b.code));
  }

  /**
   * Get communes for a specific district
   */
  async getCommunes(provinceCode, districtCode) {
    if (!provinceCode || !districtCode) return [];
    
    const hierarchy = await this.getHierarchicalData();
    const province = hierarchy[provinceCode];
    
    if (!province) return [];
    
    const district = province.districts[districtCode];
    
    if (!district) return [];

    return Object.values(district.communes).map(c => ({
      code: c.code,
      name_kh: c.name_kh,
      name_en: c.name_en
    })).sort((a, b) => a.code.localeCompare(b.code));
  }

  /**
   * Get villages for a specific commune
   */
  async getVillages(provinceCode, districtCode, communeCode) {
    if (!provinceCode || !districtCode || !communeCode) return [];
    
    const hierarchy = await this.getHierarchicalData();
    const province = hierarchy[provinceCode];
    
    if (!province) return [];
    
    const district = province.districts[districtCode];
    
    if (!district) return [];
    
    const commune = district.communes[communeCode];
    
    if (!commune) return [];

    return Object.values(commune.villages).map(v => ({
      code: v.code,
      name_kh: v.name_kh,
      name_en: v.name_en
    })).sort((a, b) => a.code.localeCompare(b.code));
  }

  /**
   * Cache management
   */
  getFromCache() {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      const now = Date.now();

      if (now - timestamp > CACHE_DURATION) {
        localStorage.removeItem(CACHE_KEY);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error reading cache:', error);
      return null;
    }
  }

  saveToCache(data) {
    try {
      const cacheData = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error saving to cache:', error);
    }
  }

  clearCache() {
    localStorage.removeItem(CACHE_KEY);
    this.data = null;
    this.hierarchicalData = null;
  }
}

// Export singleton instance
export default new GeographyService();
