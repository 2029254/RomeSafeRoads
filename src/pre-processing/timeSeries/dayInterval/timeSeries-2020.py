import pandas as pd

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
dataset_2020 = pd.read_csv('dataset/source/accidents-2020/01-Gennaio.csv', sep=';', encoding='latin-1')

# import and concatenate all following csv files
for file in csv_2020:
    dataset_2020 = pd.concat([dataset_2020, pd.read_csv(file, sep=';', encoding='latin-1')], ignore_index=True)

# Select the columns of interest
columns = ['NaturaIncidente', 'Protocollo', 'DataOraIncidente']

dataset_columns = dataset_2020[columns]

dataset_rows = dataset_columns

# Convert the 'DataOraIncidente' column to a datetime object
dataset_rows['DataOraIncidente'] = pd.to_datetime(dataset_rows['DataOraIncidente'], format='%d/%m/%Y %H:%M:%S', errors='coerce')

# Drop duplicate Protocollo entries
dataset_rows.drop_duplicates(subset='Protocollo', keep='first', inplace=True)

dataset_rows.dropna(subset=['DataOraIncidente'], inplace=True)

# Creare una lista di dizionari contenenti i dati
result_data = []

# Aggiungi il conteggio per ogni giorno
date_range = pd.date_range(start='2020-01-01', end='2020-12-31')

for current_date in date_range:
    incidents_on_current_date = dataset_rows[
        (dataset_rows['DataOraIncidente'].dt.date == current_date)
    ]
    num_incidents_on_current_date = len(incidents_on_current_date)

    result_data.append({
        'DataOraIncidente': current_date,
        'NumeroIncidenti': num_incidents_on_current_date
    })

# Creare il DataFrame risultante
result_df = pd.DataFrame(result_data)

# Save the processed DataFrame
result_df.to_csv('dataset/processed/timeSeries/timeSeriesData2020_daily.csv', header=True, index=False)