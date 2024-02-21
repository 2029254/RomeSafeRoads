import pandas as pd
import geopandas as gpd
from shapely.geometry import Point

# Carica il file .geojson
gdf = gpd.read_file('dataset/source/choropleth-map/municipi.geojson')

# Lista degli anni di interesse
years = ["2019", "2020", "2021", "2022"]

for year in years:
    # Importa il file CSV per l'anno corrente
    dataset = pd.read_csv('dataset/source/death-accidents/deaths-' + year + '.csv', sep=',', encoding='latin-1')

    # Seleziona le colonne di interesse
    columns = ['Protocollo', 'Longitude', 'Latitude']
    dataset_columns = dataset[columns]

    # Itera su tutte le righe del DataFrame per ottenere il municipio per ciascuna coordinata
    municipi = []
    for index, row in dataset_columns.iterrows():
        latitude = row['Latitude']
        longitude = row['Longitude']
        point = Point(longitude, latitude)

        municipio = None
        for idx, gdf_row in gdf.iterrows():
            if gdf_row['geometry'].contains(point):
                municipio = gdf_row['nome']
                break

        municipi.append(municipio)

    # Aggiungi la colonna 'Municipio' al DataFrame originale
    dataset_columns['Municipio'] = municipi

    # Conteggio dei decessi per ogni municipio
    town_hall_count = dataset_columns.groupby('Municipio').size().reset_index(name='NumeroIncidenti')

    # Export dei risultati in un nuovo CSV per l'anno corrente
    town_hall_count.to_csv('dataset/processed/choroplethMap/choroplethMap' + year + '.csv', index=False)
