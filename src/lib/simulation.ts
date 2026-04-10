// Central simulation engine — generates realistic real-time data
export interface SimStation {
  id: string
  name: string
  lat: number
  lng: number
  zone: string
  currentStock: number
  maxCapacity: number
  status: 'operational' | 'critical' | 'offline'
  queueLength: number
  hoursToShortage: number
  riskScore: number
  address: string
  pricing: number
}

export const STATIONS: SimStation[] = [
  { id: 's1', name: 'Delhi Central Pump', lat: 28.6139, lng: 77.2090, zone: 'North', currentStock: 8200, maxCapacity: 12000, status: 'operational', queueLength: 12, hoursToShortage: 18, riskScore: 22, address: 'Connaught Place, Delhi', pricing: 96.72 },
  { id: 's2', name: 'Mumbai Highway', lat: 19.0760, lng: 72.8777, zone: 'West', currentStock: 3100, maxCapacity: 10000, status: 'critical', queueLength: 38, hoursToShortage: 4, riskScore: 81, address: 'Bandra, Mumbai', pricing: 104.21 },
  { id: 's3', name: 'Bangalore Tech Park', lat: 12.9716, lng: 77.5946, zone: 'South', currentStock: 9800, maxCapacity: 12000, status: 'operational', queueLength: 8, hoursToShortage: 24, riskScore: 12, address: 'Electronic City, Bangalore', pricing: 99.84 },
  { id: 's4', name: 'Kolkata Depot', lat: 22.5726, lng: 88.3639, zone: 'East', currentStock: 1400, maxCapacity: 8000, status: 'critical', queueLength: 52, hoursToShortage: 2, riskScore: 94, address: 'Salt Lake, Kolkata', pricing: 106.03 },
  { id: 's5', name: 'Chennai Port Fuel', lat: 13.0827, lng: 80.2707, zone: 'South', currentStock: 5800, maxCapacity: 9000, status: 'operational', queueLength: 21, hoursToShortage: 11, riskScore: 45, address: 'Port Trust, Chennai', pricing: 102.63 },
  { id: 's6', name: 'Hyderabad Ring Road', lat: 17.3850, lng: 78.4867, zone: 'South', currentStock: 600, maxCapacity: 7000, status: 'critical', queueLength: 67, hoursToShortage: 1, riskScore: 97, address: 'HITEC City, Hyderabad', pricing: 109.66 },
  { id: 's7', name: 'Ahmedabad Highway', lat: 23.0225, lng: 72.5714, zone: 'West', currentStock: 11000, maxCapacity: 15000, status: 'operational', queueLength: 5, hoursToShortage: 48, riskScore: 8, address: 'SG Highway, Ahmedabad', pricing: 96.42 },
  { id: 's8', name: 'Pune Bypass', lat: 18.5204, lng: 73.8567, zone: 'West', currentStock: 0, maxCapacity: 10000, status: 'offline', queueLength: 0, hoursToShortage: 0, riskScore: 100, address: 'Hinjawadi, Pune', pricing: 104.34 },
  { id: 's9', name: 'Jaipur Pink City Fuel', lat: 26.9124, lng: 75.7873, zone: 'North', currentStock: 4500, maxCapacity: 8000, status: 'operational', queueLength: 15, hoursToShortage: 8, riskScore: 55, address: 'MI Road, Jaipur', pricing: 108.48 },
  { id: 's10', name: 'Lucknow Center Pump', lat: 26.8467, lng: 80.9462, zone: 'North', currentStock: 3200, maxCapacity: 9000, status: 'critical', queueLength: 42, hoursToShortage: 5, riskScore: 78, address: 'Aminabad, Lucknow', pricing: 96.57 },
  { id: 's11', name: 'Guwahati River Station', lat: 26.1445, lng: 91.7362, zone: 'East', currentStock: 7500, maxCapacity: 10000, status: 'operational', queueLength: 10, hoursToShortage: 15, riskScore: 35, address: 'GS Road, Guwahati', pricing: 98.03 },
  // Additional States
  { id: 's12', name: 'Kochi Marine Drive', lat: 9.9312, lng: 76.2673, zone: 'South', currentStock: 8900, maxCapacity: 11000, status: 'operational', queueLength: 14, hoursToShortage: 26, riskScore: 18, address: 'Marine Drive, Kochi, Kerala', pricing: 101.45 },
  { id: 's13', name: 'Indore Central', lat: 22.7196, lng: 75.8577, zone: 'Central', currentStock: 2500, maxCapacity: 8000, status: 'critical', queueLength: 48, hoursToShortage: 3, riskScore: 85, address: 'Palasia, Indore, MP', pricing: 103.11 },
  { id: 's14', name: 'Chandigarh Sector 17', lat: 30.7333, lng: 76.7794, zone: 'North', currentStock: 11500, maxCapacity: 12000, status: 'operational', queueLength: 4, hoursToShortage: 72, riskScore: 5, address: 'Sector 17, Chandigarh', pricing: 95.80 },
  { id: 's15', name: 'Patna Eco Park Pump', lat: 25.5941, lng: 85.1376, zone: 'East', currentStock: 1200, maxCapacity: 7000, status: 'critical', queueLength: 60, hoursToShortage: 2, riskScore: 92, address: 'Bailey Road, Patna, Bihar', pricing: 105.20 },
  { id: 's16', name: 'Bhubaneswar Highway', lat: 20.2961, lng: 85.8245, zone: 'East', currentStock: 9000, maxCapacity: 10000, status: 'operational', queueLength: 11, hoursToShortage: 30, riskScore: 15, address: 'Khandagiri, Bhubaneswar, Odisha', pricing: 100.80 },
  { id: 's17', name: 'Srinagar Dal Fuel', lat: 34.0837, lng: 74.7973, zone: 'North', currentStock: 4100, maxCapacity: 6000, status: 'operational', queueLength: 16, hoursToShortage: 14, riskScore: 40, address: 'Boulevard Road, Srinagar, J&K', pricing: 99.50 },
  { id: 's18', name: 'Raipur Steel City Pump', lat: 21.2514, lng: 81.6296, zone: 'Central', currentStock: 3600, maxCapacity: 12000, status: 'critical', queueLength: 33, hoursToShortage: 5, riskScore: 78, address: 'Tatibandh, Raipur, Chhattisgarh', pricing: 102.10 },
  { id: 's19', name: 'Ranchi Mining Fuel', lat: 23.3441, lng: 85.3096, zone: 'East', currentStock: 8800, maxCapacity: 10000, status: 'operational', queueLength: 9, hoursToShortage: 28, riskScore: 20, address: 'Hinoo, Ranchi, Jharkhand', pricing: 98.40 },
  { id: 's20', name: 'Dehradun Valley Pump', lat: 30.3165, lng: 78.0322, zone: 'North', currentStock: 5400, maxCapacity: 8000, status: 'operational', queueLength: 18, hoursToShortage: 12, riskScore: 45, address: 'Rajpur Road, Dehradun, Uttarakhand', pricing: 97.20 },
  { id: 's21', name: 'Shimla Mall Road', lat: 31.1048, lng: 77.1734, zone: 'North', currentStock: 2000, maxCapacity: 6000, status: 'critical', queueLength: 25, hoursToShortage: 4, riskScore: 82, address: 'Cart Road, Shimla, Himachal', pricing: 96.90 },
  { id: 's22', name: 'Panaji River Gas', lat: 15.4909, lng: 73.8278, zone: 'West', currentStock: 7800, maxCapacity: 9000, status: 'operational', queueLength: 6, hoursToShortage: 32, riskScore: 10, address: 'Miramar, Panaji, Goa', pricing: 98.10 },
  { id: 's23', name: 'Shillong Hill Fuel', lat: 25.5788, lng: 91.8933, zone: 'East', currentStock: 3000, maxCapacity: 5000, status: 'operational', queueLength: 15, hoursToShortage: 9, riskScore: 50, address: 'Police Bazar, Shillong, Meghalaya', pricing: 101.00 },
  { id: 's24', name: 'Agartala Border Pump', lat: 23.8315, lng: 91.2868, zone: 'East', currentStock: 6000, maxCapacity: 8000, status: 'operational', queueLength: 7, hoursToShortage: 22, riskScore: 25, address: 'Banamalipur, Agartala, Tripura', pricing: 100.50 },
  { id: 's25', name: 'Gandhinagar Capital', lat: 23.2156, lng: 72.6369, zone: 'West', currentStock: 12000, maxCapacity: 14000, status: 'operational', queueLength: 2, hoursToShortage: 80, riskScore: 2, address: 'Sector 11, Gandhinagar, Gujarat', pricing: 96.10 },
  { id: 'gmaps_101', name: 'Shivaji Park Petrol Pump', lat: 19.0269, lng: 72.8384, zone: 'West', currentStock: 5437, maxCapacity: 6000, status: 'operational', queueLength: 6, hoursToShortage: 27, riskScore: 12, address: 'Dadar, Mumbai', pricing: 96.95 },
  { id: 'gmaps_102', name: 'Andheri East Link Gas', lat: 19.1136, lng: 72.8697, zone: 'West', currentStock: 4818, maxCapacity: 6000, status: 'operational', queueLength: 8, hoursToShortage: 14, riskScore: 5, address: 'Andheri East, Mumbai', pricing: 96.31 },
  { id: 'gmaps_103', name: 'Colaba Coastal Fuel', lat: 18.9067, lng: 72.8147, zone: 'West', currentStock: 7797, maxCapacity: 8000, status: 'operational', queueLength: 5, hoursToShortage: 57, riskScore: 25, address: 'Colaba, Mumbai', pricing: 104.82 },
  { id: 'gmaps_104', name: 'BKC Corporate Pump', lat: 19.0616, lng: 72.8658, zone: 'West', currentStock: 8479, maxCapacity: 12000, status: 'operational', queueLength: 11, hoursToShortage: 29, riskScore: 30, address: 'Bandra Kurla Complex, Mumbai', pricing: 107.17 },
  { id: 'gmaps_105', name: 'South Ex Service Station', lat: 28.5677, lng: 77.2212, zone: 'North', currentStock: 848, maxCapacity: 8000, status: 'critical', queueLength: 42, hoursToShortage: 2, riskScore: 81, address: 'South Extension, Delhi', pricing: 108.4 },
  { id: 'gmaps_106', name: 'Vasant Kunj Auto Fuel', lat: 28.5293, lng: 77.1539, zone: 'North', currentStock: 4759, maxCapacity: 10000, status: 'operational', queueLength: 8, hoursToShortage: 18, riskScore: 16, address: 'Vasant Kunj, Delhi', pricing: 106.86 },
  { id: 'gmaps_107', name: 'Chandni Chowk Depot', lat: 28.6505, lng: 77.2303, zone: 'North', currentStock: 6711, maxCapacity: 15000, status: 'operational', queueLength: 13, hoursToShortage: 41, riskScore: 22, address: 'Chandni Chowk, Delhi', pricing: 96.75 },
  { id: 'gmaps_108', name: 'Dwarka Sector 12 Gas', lat: 28.5917, lng: 77.0422, zone: 'North', currentStock: 9322, maxCapacity: 12000, status: 'operational', queueLength: 6, hoursToShortage: 65, riskScore: 25, address: 'Dwarka, Delhi', pricing: 103.66 },
  { id: 'gmaps_109', name: 'Koramangala Fuel Center', lat: 12.9279, lng: 77.6271, zone: 'South', currentStock: 9771, maxCapacity: 10000, status: 'operational', queueLength: 3, hoursToShortage: 14, riskScore: 26, address: 'Koramangala, Bangalore', pricing: 98.19 },
  { id: 'gmaps_110', name: 'Indiranagar 100ft Pump', lat: 12.9784, lng: 77.6408, zone: 'South', currentStock: 5907, maxCapacity: 10000, status: 'operational', queueLength: 15, hoursToShortage: 18, riskScore: 17, address: 'Indiranagar, Bangalore', pricing: 98.89 },
  { id: 'gmaps_111', name: 'Whitefield IT Park Auto', lat: 12.9698, lng: 77.7499, zone: 'South', currentStock: 7032, maxCapacity: 10000, status: 'operational', queueLength: 7, hoursToShortage: 25, riskScore: 26, address: 'Whitefield, Bangalore', pricing: 98.74 },
  { id: 'gmaps_112', name: 'Malleswaram Circle Fuel', lat: 13.0031, lng: 77.5701, zone: 'South', currentStock: 4587, maxCapacity: 6000, status: 'operational', queueLength: 13, hoursToShortage: 27, riskScore: 10, address: 'Malleswaram, Bangalore', pricing: 101.47 },
  { id: 'gmaps_113', name: 'Anna Nagar Western Pump', lat: 13.085, lng: 80.2101, zone: 'South', currentStock: 9608, maxCapacity: 10000, status: 'operational', queueLength: 7, hoursToShortage: 65, riskScore: 29, address: 'Anna Nagar, Chennai', pricing: 105.86 },
  { id: 'gmaps_114', name: 'T Nagar Central Gas', lat: 13.0405, lng: 80.2337, zone: 'South', currentStock: 5784, maxCapacity: 8000, status: 'operational', queueLength: 8, hoursToShortage: 29, riskScore: 7, address: 'T Nagar, Chennai', pricing: 97.95 },
  { id: 'gmaps_115', name: 'Adyar Bridge Service', lat: 13.0012, lng: 80.2565, zone: 'South', currentStock: 9483, maxCapacity: 15000, status: 'operational', queueLength: 12, hoursToShortage: 43, riskScore: 17, address: 'Adyar, Chennai', pricing: 107.39 },
  { id: 'gmaps_116', name: 'OMR Tech Fuel', lat: 12.9181, lng: 80.23, zone: 'South', currentStock: 6969, maxCapacity: 12000, status: 'operational', queueLength: 4, hoursToShortage: 27, riskScore: 28, address: 'OMR Road, Chennai', pricing: 102.86 },
  { id: 'gmaps_117', name: 'Jubilee Hills Checkpost', lat: 17.4326, lng: 78.4071, zone: 'South', currentStock: 1419, maxCapacity: 10000, status: 'critical', queueLength: 62, hoursToShortage: 4, riskScore: 86, address: 'Jubilee Hills, Hyderabad', pricing: 98.07 },
  { id: 'gmaps_118', name: 'Banjara Hills Road 10', lat: 17.4124, lng: 78.4419, zone: 'South', currentStock: 593, maxCapacity: 8000, status: 'critical', queueLength: 73, hoursToShortage: 1, riskScore: 78, address: 'Banjara Hills, Hyderabad', pricing: 97.14 },
  { id: 'gmaps_119', name: 'Secunderabad Station Fuel', lat: 17.4399, lng: 78.4983, zone: 'South', currentStock: 1110, maxCapacity: 8000, status: 'critical', queueLength: 29, hoursToShortage: 4, riskScore: 87, address: 'Secunderabad, Hyderabad', pricing: 103.34 },
  { id: 'gmaps_120', name: 'Gachibowli Stadium Gas', lat: 17.4401, lng: 78.3489, zone: 'South', currentStock: 9332, maxCapacity: 12000, status: 'operational', queueLength: 15, hoursToShortage: 72, riskScore: 5, address: 'Gachibowli, Hyderabad', pricing: 104.52 },
  { id: 'gmaps_121', name: 'Park Street Elite Pump', lat: 22.5516, lng: 88.3519, zone: 'East', currentStock: 5548, maxCapacity: 6000, status: 'operational', queueLength: 12, hoursToShortage: 33, riskScore: 8, address: 'Park Street, Kolkata', pricing: 99.11 },
  { id: 'gmaps_122', name: 'Howrah Bridge Service', lat: 22.5851, lng: 88.3468, zone: 'East', currentStock: 503, maxCapacity: 8000, status: 'critical', queueLength: 71, hoursToShortage: 3, riskScore: 91, address: 'Howrah, Kolkata', pricing: 105.67 },
  { id: 'gmaps_123', name: 'Ballygunge Circular Fuel', lat: 22.528, lng: 88.3653, zone: 'East', currentStock: 10889, maxCapacity: 15000, status: 'operational', queueLength: 15, hoursToShortage: 52, riskScore: 21, address: 'Ballygunge, Kolkata', pricing: 103.53 },
  { id: 'gmaps_124', name: 'Rajarhat New Town Gas', lat: 22.5815, lng: 88.4554, zone: 'East', currentStock: 4523, maxCapacity: 8000, status: 'operational', queueLength: 10, hoursToShortage: 61, riskScore: 21, address: 'New Town, Kolkata', pricing: 107.86 },
  { id: 'gmaps_125', name: 'Koregaon Park Fuel', lat: 18.5362, lng: 73.8939, zone: 'West', currentStock: 14005, maxCapacity: 15000, status: 'operational', queueLength: 2, hoursToShortage: 19, riskScore: 16, address: 'Koregaon Park, Pune', pricing: 107.3 },
  { id: 'gmaps_126', name: 'Deccan Gymkhana Pump', lat: 18.5152, lng: 73.8406, zone: 'West', currentStock: 4474, maxCapacity: 10000, status: 'operational', queueLength: 5, hoursToShortage: 68, riskScore: 23, address: 'Deccan, Pune', pricing: 108.26 },
  { id: 'gmaps_127', name: 'Viman Nagar Airport Auto', lat: 18.563, lng: 73.911, zone: 'West', currentStock: 535, maxCapacity: 6000, status: 'critical', queueLength: 73, hoursToShortage: 5, riskScore: 79, address: 'Viman Nagar, Pune', pricing: 96.8 },
  { id: 'gmaps_128', name: 'Baner Highway Service', lat: 18.559, lng: 73.7868, zone: 'West', currentStock: 6971, maxCapacity: 12000, status: 'operational', queueLength: 10, hoursToShortage: 67, riskScore: 24, address: 'Baner, Pune', pricing: 100.92 },
  { id: 'gmaps_129', name: 'Vastrapur Lake Gas', lat: 23.036, lng: 72.5303, zone: 'West', currentStock: 5753, maxCapacity: 8000, status: 'operational', queueLength: 8, hoursToShortage: 54, riskScore: 25, address: 'Vastrapur, Ahmedabad', pricing: 100.23 },
  { id: 'gmaps_130', name: 'Navrangpura Auto Fuel', lat: 23.0383, lng: 72.5527, zone: 'West', currentStock: 747, maxCapacity: 15000, status: 'critical', queueLength: 40, hoursToShortage: 2, riskScore: 77, address: 'Navrangpura, Ahmedabad', pricing: 99.73 },
  { id: 'gmaps_131', name: 'Satellite Road Pump', lat: 23.0232, lng: 72.5226, zone: 'West', currentStock: 9608, maxCapacity: 15000, status: 'operational', queueLength: 2, hoursToShortage: 16, riskScore: 27, address: 'Satellite, Ahmedabad', pricing: 103.84 },
  { id: 'gmaps_132', name: 'Bopal Ring Road Gas', lat: 23.027, lng: 72.4633, zone: 'West', currentStock: 3457, maxCapacity: 8000, status: 'operational', queueLength: 15, hoursToShortage: 33, riskScore: 7, address: 'Bopal, Ahmedabad', pricing: 102.2 },
  { id: 'gmaps_133', name: 'Malviya Nagar Fuel', lat: 26.854, lng: 75.8159, zone: 'North', currentStock: 719, maxCapacity: 10000, status: 'critical', queueLength: 59, hoursToShortage: 2, riskScore: 93, address: 'Malviya Nagar, Jaipur', pricing: 103.07 },
  { id: 'gmaps_134', name: 'Mansarovar Depot', lat: 26.8617, lng: 75.7601, zone: 'North', currentStock: 916, maxCapacity: 8000, status: 'critical', queueLength: 37, hoursToShortage: 1, riskScore: 78, address: 'Mansarovar, Jaipur', pricing: 104.23 },
  { id: 'gmaps_135', name: 'Vaishali Nagar Service', lat: 26.9069, lng: 75.748, zone: 'North', currentStock: 920, maxCapacity: 10000, status: 'critical', queueLength: 54, hoursToShortage: 1, riskScore: 95, address: 'Vaishali Nagar, Jaipur', pricing: 108.78 },
  { id: 'gmaps_136', name: 'Gomti Nagar Premium Pump', lat: 26.8488, lng: 80.999, zone: 'North', currentStock: 4049, maxCapacity: 6000, status: 'operational', queueLength: 13, hoursToShortage: 33, riskScore: 30, address: 'Gomti Nagar, Lucknow', pricing: 107.06 },
  { id: 'gmaps_137', name: 'Hazratganj Main Fuel', lat: 26.8522, lng: 80.9419, zone: 'North', currentStock: 4758, maxCapacity: 8000, status: 'operational', queueLength: 10, hoursToShortage: 40, riskScore: 9, address: 'Hazratganj, Lucknow', pricing: 100.91 },
  { id: 'gmaps_138', name: 'Indira Nagar Gas', lat: 26.8837, lng: 80.9859, zone: 'North', currentStock: 755, maxCapacity: 10000, status: 'critical', queueLength: 80, hoursToShortage: 1, riskScore: 89, address: 'Indira Nagar, Lucknow', pricing: 106.31 },
  { id: 'gmaps_139', name: 'Edapally Junction Fuel', lat: 10.0261, lng: 76.3125, zone: 'South', currentStock: 6828, maxCapacity: 15000, status: 'operational', queueLength: 12, hoursToShortage: 46, riskScore: 5, address: 'Edapally, Kochi', pricing: 108.57 },
  { id: 'gmaps_140', name: 'Fort Kochi Coastal Pump', lat: 9.9658, lng: 76.2415, zone: 'South', currentStock: 6529, maxCapacity: 8000, status: 'operational', queueLength: 9, hoursToShortage: 42, riskScore: 11, address: 'Fort Kochi, Kochi', pricing: 107.11 },
  { id: 'gmaps_141', name: 'Vyttila Hub Service', lat: 9.9667, lng: 76.3183, zone: 'South', currentStock: 3952, maxCapacity: 6000, status: 'operational', queueLength: 2, hoursToShortage: 36, riskScore: 13, address: 'Vyttila, Kochi', pricing: 107.97 },
  { id: 'gmaps_142', name: 'Sector 35 Premium Gas', lat: 30.7226, lng: 76.7667, zone: 'North', currentStock: 8265, maxCapacity: 12000, status: 'operational', queueLength: 13, hoursToShortage: 58, riskScore: 30, address: 'Sector 35, Chandigarh', pricing: 102.78 },
  { id: 'gmaps_143', name: 'Industrial Area Phase 1', lat: 30.7029, lng: 76.7909, zone: 'North', currentStock: 6355, maxCapacity: 12000, status: 'operational', queueLength: 6, hoursToShortage: 25, riskScore: 6, address: 'Ind. Area, Chandigarh', pricing: 103.11 },
  { id: 'gmaps_144', name: 'Lake Club Fuel Center', lat: 30.7415, lng: 76.799, zone: 'North', currentStock: 11138, maxCapacity: 15000, status: 'operational', queueLength: 2, hoursToShortage: 15, riskScore: 23, address: 'Sukhna Lake, Chandigarh', pricing: 101.68 },
  { id: 'gmaps_145', name: 'Paltan Bazar Terminus Fuel', lat: 26.1772, lng: 91.758, zone: 'East', currentStock: 6931, maxCapacity: 15000, status: 'operational', queueLength: 10, hoursToShortage: 17, riskScore: 10, address: 'Paltan Bazar, Guwahati', pricing: 95.96 },
  { id: 'gmaps_146', name: 'Dispur Secretariat Pump', lat: 26.1438, lng: 91.7898, zone: 'East', currentStock: 4053, maxCapacity: 6000, status: 'operational', queueLength: 3, hoursToShortage: 72, riskScore: 23, address: 'Dispur, Guwahati', pricing: 98.45 },
  { id: 'gmaps_147', name: 'Vijay Nagar Square Auto', lat: 22.7533, lng: 75.8937, zone: 'Central', currentStock: 7343, maxCapacity: 15000, status: 'operational', queueLength: 8, hoursToShortage: 54, riskScore: 23, address: 'Vijay Nagar, Indore', pricing: 102.91 },
  { id: 'gmaps_148', name: 'Bhawarkua Heavy Fuel', lat: 22.6931, lng: 75.869, zone: 'Central', currentStock: 5673, maxCapacity: 10000, status: 'operational', queueLength: 12, hoursToShortage: 57, riskScore: 15, address: 'Bhawarkua, Indore', pricing: 98.34 },
  { id: 'gmaps_149', name: 'Anna Salai Central Pump', lat: 13.0604, lng: 80.2625, zone: 'South', currentStock: 8200, maxCapacity: 12000, status: 'operational', queueLength: 4, hoursToShortage: 38, riskScore: 12, address: 'Mount Road, Chennai', pricing: 104.55 },
  { id: 'gmaps_150', name: 'Velachery Bypass Gas', lat: 12.9753, lng: 80.2206, zone: 'South', currentStock: 1540, maxCapacity: 10000, status: 'critical', queueLength: 45, hoursToShortage: 3, riskScore: 82, address: 'Velachery, Chennai', pricing: 103.20 },
  { id: 'gmaps_151', name: 'Guindy Industrial Fuel', lat: 13.0067, lng: 80.2206, zone: 'South', currentStock: 6300, maxCapacity: 8000, status: 'operational', queueLength: 12, hoursToShortage: 24, riskScore: 20, address: 'Guindy, Chennai', pricing: 105.10 },
  { id: 'gmaps_152', name: 'Marina Coastal Station', lat: 13.0500, lng: 80.2824, zone: 'South', currentStock: 7800, maxCapacity: 15000, status: 'operational', queueLength: 8, hoursToShortage: 45, riskScore: 15, address: 'Marina Beach, Chennai', pricing: 106.80 },
  { id: 'gmaps_153', name: 'Mylapore Temple Fuel', lat: 13.0368, lng: 80.2676, zone: 'South', currentStock: 3200, maxCapacity: 6000, status: 'operational', queueLength: 18, hoursToShortage: 18, riskScore: 40, address: 'Mylapore, Chennai', pricing: 104.90 },
  { id: 'gmaps_154', name: 'Nungambakkam Oasis', lat: 13.0631, lng: 80.2396, zone: 'South', currentStock: 9100, maxCapacity: 10000, status: 'operational', queueLength: 5, hoursToShortage: 50, riskScore: 8, address: 'Nungambakkam, Chennai', pricing: 105.50 },
  { id: 'gmaps_155', name: 'Taramani Tech Gas', lat: 12.9786, lng: 80.2449, zone: 'South', currentStock: 4300, maxCapacity: 8000, status: 'operational', queueLength: 10, hoursToShortage: 26, riskScore: 18, address: 'Taramani, Chennai', pricing: 104.22 },
  { id: 'gmaps_156', name: 'Thiruvanmiyur Coastal Pump', lat: 12.9860, lng: 80.2606, zone: 'South', currentStock: 7500, maxCapacity: 10000, status: 'operational', queueLength: 6, hoursToShortage: 40, riskScore: 11, address: 'Thiruvanmiyur, Chennai', pricing: 105.75 },
  { id: 'gmaps_157', name: 'Ashok Nagar Circle Fuel', lat: 13.0360, lng: 80.2084, zone: 'South', currentStock: 1200, maxCapacity: 8000, status: 'critical', queueLength: 52, hoursToShortage: 2, riskScore: 88, address: 'Ashok Nagar, Chennai', pricing: 104.95 },
  { id: 'gmaps_158', name: 'Vadapalani Forum Gas', lat: 13.0500, lng: 80.2120, zone: 'South', currentStock: 9800, maxCapacity: 15000, status: 'operational', queueLength: 8, hoursToShortage: 62, riskScore: 5, address: 'Vadapalani, Chennai', pricing: 106.10 },
  { id: 'gmaps_159', name: 'Perambur Loco Service', lat: 13.1098, lng: 80.2427, zone: 'South', currentStock: 3400, maxCapacity: 6000, status: 'operational', queueLength: 15, hoursToShortage: 12, riskScore: 55, address: 'Perambur, Chennai', pricing: 103.80 },
]

export interface SimAlert {
  id: string
  type: 'shortage' | 'panic_buying' | 'anomaly' | 'system'
  severity: 'low' | 'medium' | 'high' | 'critical'
  zone: string
  message: string
  timeAgo: string
  resolved: boolean
}

export const ALERTS: SimAlert[] = [
  { id: 'a1', type: 'panic_buying', severity: 'critical', zone: 'South', message: 'Panic buying detected at Hyderabad Ring Road — 67 vehicles queued, demand 3.2σ above baseline', timeAgo: '3 min ago', resolved: false },
  { id: 'a2', type: 'shortage', severity: 'high', zone: 'East', message: 'Kolkata Depot predicted to run dry in 2 hours. Emergency resupply recommended.', timeAgo: '11 min ago', resolved: false },
  { id: 'a3', type: 'anomaly', severity: 'medium', zone: 'West', message: 'Unusual demand spike at Mumbai Highway — 38 vehicles, 181% above 7-day average', timeAgo: '24 min ago', resolved: false },
  { id: 'a4', type: 'system', severity: 'low', zone: 'West', message: 'Pune Bypass stock depleted. Offline status flagged. Supply truck dispatched ETA 3h.', timeAgo: '1 hr ago', resolved: false },
  { id: 'a5', type: 'shortage', severity: 'high', zone: 'West', message: 'Mumbai Highway forecasted shortage in 4 hours. Pre-emptive quota restriction activated.', timeAgo: '2 hr ago', resolved: false },
]

export interface SimWhatsAppMessage {
  id: string
  from: string
  phone: string
  message: string
  timestamp: string
  intent: string
  reply: string
  processed: boolean
}

export const WHATSAPP_MESSAGES: SimWhatsAppMessage[] = [
  { id: 'w1', from: 'Ramesh K.', phone: '+91 98765 43210', message: 'Nearest petrol pump with stock?', timestamp: '11:42 AM', intent: 'availability_check', reply: '', processed: false },
  { id: 'w2', from: 'Priya S.', phone: '+91 87654 32109', message: 'My fuel credits balance?', timestamp: '11:38 AM', intent: 'credit_check', reply: '', processed: false },
  { id: 'w3', from: 'Amit V.', phone: '+91 76543 21098', message: 'Book 10L for today evening', timestamp: '11:35 AM', intent: 'booking', reply: '', processed: false },
  { id: 'w4', from: 'Sunita M.', phone: '+91 65432 10987', message: 'East zone mein kaunsa pump khula hai?', timestamp: '11:29 AM', intent: 'availability_check', reply: '', processed: false },
  { id: 'w5', from: 'Dev P.', phone: '+91 54321 09876', message: 'Alert when stock below 20% in North', timestamp: '11:15 AM', intent: 'alert_setup', reply: '', processed: false },
]

// Simulate real-time fluctuation
export function getLiveStations(): SimStation[] {
  return STATIONS.map(s => ({
    ...s,
    currentStock: s.status === 'offline' ? 0 : Math.max(0, s.currentStock + (Math.random() - 0.5) * 200),
    queueLength: s.status === 'offline' ? 0 : Math.max(0, s.queueLength + Math.round((Math.random() - 0.4) * 4)),
  }))
}

export function getZoneSummary() {
  const zones = ['North', 'South', 'East', 'West']
  return zones.map(zone => {
    const zoneStations = STATIONS.filter(s => s.zone === zone)
    const avgStock = zoneStations.reduce((a, s) => a + s.currentStock / s.maxCapacity, 0) / zoneStations.length
    const riskScore = Math.round((1 - avgStock) * 100)
    return {
      zone,
      stations: zoneStations.length,
      avgStockPct: Math.round(avgStock * 100),
      riskScore,
      criticalStations: zoneStations.filter(s => s.status === 'critical').length,
    }
  })
}

export function getKpiMetrics() {
  const operational = STATIONS.filter(s => s.status === 'operational').length
  const critical = STATIONS.filter(s => s.status === 'critical').length
  const totalStock = STATIONS.reduce((a, s) => a + s.currentStock, 0)
  const totalCapacity = STATIONS.reduce((a, s) => a + s.maxCapacity, 0)
  const totalQueue = STATIONS.reduce((a, s) => a + s.queueLength, 0)

  return {
    operational,
    critical,
    offline: STATIONS.filter(s => s.status === 'offline').length,
    totalStations: STATIONS.length,
    systemStock: Math.round((totalStock / totalCapacity) * 100),
    totalQueue,
    criticalAlerts: ALERTS.filter(a => a.severity === 'critical' && !a.resolved).length,
    avgRiskScore: Math.round(STATIONS.reduce((a, s) => a + s.riskScore, 0) / STATIONS.length),
  }
}
