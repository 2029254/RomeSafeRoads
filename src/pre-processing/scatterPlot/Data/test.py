import geopandas as gpd
from shapely.geometry import Point

# Carica il file .geojson
gdf = gpd.read_file('dataset/source/choropleth-map/municipi.geojson')

# Le tue coordinate di riferimento
latitude = 41.8103
longitude = 12.4856


# Crea un punto utilizzando le coordinate
point = Point(longitude, latitude)

# Itera su tutte le geometrie nel file .geojson per trovare quella che contiene il punto
municipio = None
for index, row in gdf.iterrows():
    if row['geometry'].contains(point):
        municipio = row['nome']
        break

# Stampa il municipio
if municipio:
    print(f"Le coordinate ricadono nel municipio: {municipio}")
else:
    print("Nessun municipio trovato per le coordinate fornite.")
