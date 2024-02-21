import pandas
import geopandas as gpd
from shapely.geometry import Point

# Carica il file .geojson
gdf = gpd.read_file('dataset/source/choropleth-map/municipi.geojson')

# paths of csv files about 2020
csv_2020 = [
    'dataset/source/accidents-2020/02-Febbraio.csv',
    'dataset/source/accidents-2020/03-Marzo.csv',
    'dataset/source/accidents-2020/04-Aprile.csv',
    'dataset/source/accidents-2020/05-Maggio.csv',
    'dataset/source/accidents-2020/06-Giugno.csv',
    'dataset/source/accidents-2020/07-Luglio.csv',
    'dataset/source/accidents-2020/08-Agosto.csv',
    'dataset/source/accidents-2020/09-Settembre.csv',
    'dataset/source/accidents-2020/10-Ottobre.csv',
    'dataset/source/accidents-2020/11-Novembre.csv',
    'dataset/source/accidents-2020/12-Dicembre.csv'
]

# import the first csv file
dataset_2020 = pandas.read_csv('dataset/source/accidents-2020/01-Gennaio.csv', sep=';', encoding='latin-1')

# import and concat all following csv files
for file in csv_2020:
    dataset_2020 = pandas.concat([dataset_2020, pandas.read_csv(file, sep=';', encoding='latin-1')], ignore_index=True)

dataset = dataset_2020[(dataset_2020['Deceduto'] == -1) | (dataset_2020['Deceduto'] == '-1')]

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
town_hall_count.to_csv('dataset/processed/choroplethMap/choroplethMap2020.csv', index=False)
