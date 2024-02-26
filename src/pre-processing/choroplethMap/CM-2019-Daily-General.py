import pandas
import geopandas as gpd
from shapely.geometry import Point

# Carica il file .geojson
gdf = gpd.read_file('dataset/source/choropleth-map/municipi.geojson')

# paths of csv files about 2019
csv_2019 = [
    'dataset/source/accidents-2019/02-Febbraio.csv',
    'dataset/source/accidents-2019/03-Marzo.csv',
    'dataset/source/accidents-2019/04-Aprile.csv',
    'dataset/source/accidents-2019/05-Maggio.csv',
    'dataset/source/accidents-2019/06-Giugno.csv',
    'dataset/source/accidents-2019/07-Luglio.csv',
    'dataset/source/accidents-2019/08-Agosto.csv',
    'dataset/source/accidents-2019/09-Settembre.csv',
    'dataset/source/accidents-2019/10-Ottobre.csv',
    'dataset/source/accidents-2019/11-Novembre.csv',
    'dataset/source/accidents-2019/12-Dicembre.csv'
]

# import the first csv file
dataset_2019 = pandas.read_csv('dataset/source/accidents-2019/01-Gennaio.csv', sep=';', encoding='latin-1')

# Importa e concatena tutti i file CSV successivi
for file in csv_2019:
    # Leggi il file CSV
    df = pandas.read_csv(file, sep=';', encoding='latin-1')

    # Se è il file di giugno, sostituisci la virgola con il punto nelle colonne 'Latitude' e 'Longitude'
    if '06-Giugno' in file:
        df['Latitude'] = df['Latitude'].str.replace(',', '.')
        df['Longitude'] = df['Longitude'].str.replace(',', '.')

    # Concatena il DataFrame letto con quello complessivo
    dataset_2019 = pandas.concat([dataset_2019, df], ignore_index=True)

dataset = dataset_2019[(dataset_2019['Deceduto'] != -1) | (dataset_2019['Deceduto'] != '-1')]

# Seleziona le colonne di interesse
columns = ['Protocollo', 'Longitude', 'Latitude', 'DataOraIncidente']
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

dataset_columns['DataOraIncidente'] = pandas.to_datetime(dataset_columns['DataOraIncidente'], format='%d/%m/%Y %H:%M:%S',
                                                      errors='coerce')

# Export dei risultati in un nuovo CSV per l'anno corrente
dataset_columns.to_csv('dataset/processed/choroplethMap/choroplethMapDailyGeneral2019.csv', index=False)
