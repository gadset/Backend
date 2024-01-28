

const sendWhatsappMsg = async({destination, campaignName, templateParams}) => {
	const details = {
 "apiKey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1YjRhODljMWJkN2RjMjIyMmRiYTA4NiIsIm5hbWUiOiJUYW1ib29sYSIsImFwcE5hbWUiOiJBaVNlbnN5IiwiY2xpZW50SWQiOiI2NWI0YTg5YzFiZDdkYzIyMjJkYmEwODEiLCJhY3RpdmVQbGFuIjoiQkFTSUNfTU9OVEhMWSIsImlhdCI6MTcwNjMzODQ2MH0.bfF2gbz_75LQDvbag9ikmixmsLXDDJqCkTyB1ddkUSs",
 "campaignName": campaignName,
 "destination": destination,
 "userName": "venkatesh",
 "templateParams" : templateParams
}

const apiUrl = 'https://backend.aisensy.com/campaign/t1/api/v2';
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(details),
    });

    if (response.ok) {
      const responseData = await response.json();
      console.log('API response:', responseData);
    } else {
      console.error('Failed to make API call:', response.statusText);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }

}

module.exports =  {sendWhatsappMsg};