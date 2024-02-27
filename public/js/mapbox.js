/* eslint-disable */

const displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoiZ3VpdmVjY2hpIiwiYSI6ImNsc2x5ZmV5aTBnMWEya3A2bnhrMHVhcjkifQ.0TJJTKi4yNpZGJAv3dXoTQ'
  const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/guivecchi/clslyxgjx00mg01pubw9y44ga', // style URL,
    scrollZoom: false
  })

  const bounds = new mapboxgl.LngLatBounds()

  locations.forEach((location) => {
    // Create market
    const el = document.createElement('div')
    el.className = 'marker'

    // Add market
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom'
    })
      .setLngLat(location.coordinates)
      .addTo(map)

    // Add popup
    new mapboxgl.Popup({ offset: 30 })
      .setLngLat(location.coordinates)
      .setHTML(`<p>Day ${location.day}: ${location.description}</p>`)
      .addTo(map)

    // Extend map bounds to include current location
    bounds.extend(location.coordinates)
  })

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100
    }
  })
}

export { displayMap }
