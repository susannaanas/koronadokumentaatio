/* global L Tabletop */

/*
 * Script to display two tables from Google Sheets as point and polygon layers using Leaflet
 * The Sheets are then imported using Tabletop.js and overwrite the initially laded layers
 */

// init() is called as soon as the page loads
function init() {
  // PASTE YOUR URLs HERE
  // these URLs come from Google Sheets 'shareable link' form
  // the first is the polygon layer and the second the points
  var pointsURL =
    "https://docs.google.com/spreadsheets/d/1X55II1fEv9rnCIw9vZxN2x187o3k9irraoikggUFDo0/edit?usp=sharing";

  Tabletop.init({ key: pointsURL, callback: addPoints, simpleSheet: true }); // simpleSheet assumes there is only one table and automatically sends its data
}
window.addEventListener("DOMContentLoaded", init);

// Create a new Leaflet map centered on the continental US
var map = L.map("map", {zoomControl:false});
var zoom = L.control.zoom({position: 'bottomleft'});
zoom.addTo(map);

// This is the Carto Positron basemap
var basemap = L.tileLayer(
  "https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}{r}.png",
  {
    attribution:
      "&copy; <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> &copy; <a href='http://cartodb.com/attributions'>CartoDB</a>",
    subdomains: "abcd",
    maxZoom: 19
  }
);
basemap.addTo(map);

var sidebar = L.control
  .sidebar({
    container: "sidebar",
    closeButton: true,
    position: "right"
  })
  .addTo(map);

let panelID = "my-info-panel";
var panelContent = {
  id: panelID,
  tab: "<i class='fa fa-bars active'></i>",
  pane: "<p id='sidebar-content'></p>",
  title: "<h2 id='sidebar-title'>Ingen dokumentation vald</h2>"
};
sidebar.addPanel(panelContent);

map.on("click", function() {
  sidebar.close(panelID);
});

// These are declared outisde the functions so that the functions can check if they already exist
var pointGroupLayer;

// addPoints is a bit simpler, as no GeoJSON is needed for the points
// It does the same check to overwrite the existing points layer once the Google Sheets data comes along
function addPoints(data) {
  if (pointGroupLayer != null) {
    pointGroupLayer.remove();
  }
  pointGroupLayer = L.featureGroup().addTo(map);

  for (var row = 0; row < data.length; row++) {
    var marker = L.marker([data[row].Latitud, data[row].Longitud]).addTo(
      pointGroupLayer
    );

    // UNCOMMENT THIS LINE TO USE POPUPS
    //marker.bindPopup('<h2>' + data[row].location + '</h2>There's a ' + data[row].level + ' ' + data[row].category + ' here');

    // COMMENT THE NEXT 14 LINES TO DISABLE SIDEBAR FOR THE MARKERS
    marker.feature = {
      properties: {
        institution: data[row]["Institution"],
        dokumentation: data[row]["Dokumentationens namn"],
        url: data[row]["Dokumentationens webbplats"],
        kontaktperson: data[row]["Kontaktperson"],
        mejl: data[row]["Mejl till kontaktperson (om det ska synas)"],
        telefon: data[row]["Telefonnr till kontaktperson (om det ska synas)"]
      }
    };
    marker.on({
      click: function(e) {
        L.DomEvent.stopPropagation(e);
        document.getElementById("sidebar-title").innerHTML =
          e.target.feature.properties.institution;
        document.getElementById("sidebar-content").innerHTML = "";
        if(e.target.feature.properties.dokumentation != "") {
          document.getElementById("sidebar-content").innerHTML += "Dokumentation: " + e.target.feature.properties.dokumentation;
        }
        if(e.target.feature.properties.url != "") {
          document.getElementById("sidebar-content").innerHTML += '<br/>Webbplats: <a href="' + e.target.feature.properties.url + '" target="_blank">' + e.target.feature.properties.url + "</a>"
        }
        if(e.target.feature.properties.kontaktperson != "") {
          document.getElementById("sidebar-content").innerHTML += "<br/>Kontaktperson: " + e.target.feature.properties.kontaktperson;
        }
        if(e.target.feature.properties.mejl != "") {
          document.getElementById("sidebar-content").innerHTML += "<br/>Mejladress: " + e.target.feature.properties.mejl;
        }
        if(e.target.feature.properties.telefon != "") {
          document.getElementById("sidebar-content").innerHTML += "<br/>Telefon: " + e.target.feature.properties.telefon;
        }
        sidebar.open(panelID);
      }
    });

    // AwesomeMarkers is used to create fancier icons
    var icon = L.AwesomeMarkers.icon({
      icon: "info-sign",
      iconColor: "white",
      markerColor: "green",
      prefix: "glyphicon",
      extraClasses: "fa-rotate-0"
    });
    marker.setIcon(icon);
  }
  map.fitBounds(pointGroupLayer.getBounds());
}
