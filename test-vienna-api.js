// Test script to check Vienna API data fields
async function testViennaAPI() {
  const endpoints = [
    'https://data.wien.gv.at/daten/wfs?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:PARKINFOOGD&srsName=EPSG:4326&outputFormat=json&maxFeatures=5',
    'https://data.wien.gv.at/daten/wfs?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:PARKANLAGENOGD&srsName=EPSG:4326&outputFormat=json&maxFeatures=5',
    'https://data.wien.gv.at/daten/wfs?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:GRUENANLAGENOGD&srsName=EPSG:4326&outputFormat=json&maxFeatures=5',
    // Try different base URL
    'https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:PARKINFOOGD&srsName=EPSG:4326&outputFormat=json&maxFeatures=5',
    'https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:PARKANLAGENOGD&srsName=EPSG:4326&outputFormat=json&maxFeatures=5',
    'https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:GRUENANLAGENOGD&srsName=EPSG:4326&outputFormat=json&maxFeatures=5'
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`\n=== Testing endpoint: ${endpoint} ===`);
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        console.log(`Failed with status: ${response.status}`);
        continue;
      }
      
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        console.log(`✅ Success! Found ${data.features.length} features`);
        console.log('\n📋 Available properties in first feature:');
        console.log(Object.keys(data.features[0].properties));
        
        console.log('\n📄 Sample feature data:');
        console.log(JSON.stringify(data.features[0], null, 2));
        
        console.log('\n🔍 Properties of first 3 features:');
        data.features.slice(0, 3).forEach((feature, index) => {
          console.log(`\nFeature ${index + 1}:`);
          Object.entries(feature.properties).forEach(([key, value]) => {
            console.log(`  ${key}: ${value}`);
          });
        });
        
        return; // Stop after first successful endpoint
      }
    } catch (error) {
      console.log(`❌ Error:`, error.message);
    }
  }
  
  console.log('❌ All endpoints failed');
}

// Run the test
testViennaAPI();
