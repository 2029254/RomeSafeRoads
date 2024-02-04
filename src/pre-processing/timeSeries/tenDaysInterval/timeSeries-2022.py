import pandas as pd

# paths of csv files about 2022
csv_2022 = [
    'dataset/source/accidents-2022/02-Febbraio.csv',
    'dataset/source/accidents-2022/03-Marzo.csv',
    'dataset/source/accidents-2022/04-Aprile.csv',
    'dataset/source/accidents-2022/05-Maggio.csv',
    'dataset/source/accidents-2022/06-Giugno.csv',
    'dataset/source/accidents-2022/07-Luglio.csv',
    'dataset/source/accidents-2022/08-Agosto.csv'
]

dataset_2022 = pd.read_csv('dataset/source/accidents-2022/01-Gennaio.csv', sep=';', encoding='latin-1')

# import and concatenate all following csv files
for file in csv_2022:
    dataset_2022 = pd.concat([dataset_2022, pd.read_csv(file, sep=';', encoding='latin-1')], ignore_index=True)

# Select the columns of interest
columns = ['NaturaIncidente', 'Protocollo', 'DataOraIncidente']

dataset_columns = dataset_2022[columns]

dataset_rows = dataset_columns

# Convert the 'DataOraIncidente' column to a datetime object
dataset_rows['DataOraIncidente'] = pd.to_datetime(dataset_rows['DataOraIncidente'], format='%d/%m/%Y %H:%M:%S',
                                                  errors='coerce')


# Drop duplicate Protocollo entries
dataset_rows.drop_duplicates(subset='Protocollo', keep='first', inplace=True)

dataset_rows.dropna(subset=['DataOraIncidente'], inplace=True)


# Define a function to round the date to the nearest 10 days

# Creare una lista di dizionari contenenti i dati
result_data = []

# Aggiungi il conteggio per il 1 gennaio separatamente
start_date = pd.to_datetime('2022-01-02')
incidents_on_jan_1 = dataset_rows[
    (dataset_rows['DataOraIncidente'] < start_date)
]
num_incidents_on_jan_1 = len(incidents_on_jan_1)

result_data.append({
    'DataOraIncidente':  pd.to_datetime('2022-01-01'),
    'NumeroIncidenti': num_incidents_on_jan_1
})

# Date range da 1 gennaio 2022 a 31 dicembre 2022, con intervallo di 10 giorni
date_range = pd.date_range(start='2022-01-01', end='2022-12-31', freq='10D')

# Iterare sugli intervalli di 10 giorni
for start_date in date_range:
    end_date = start_date + pd.Timedelta(days=10)  # Calcola la data di fine intervallo
    incidents_in_interval = dataset_rows[
        (dataset_rows['DataOraIncidente'] >= start_date) &
        (dataset_rows['DataOraIncidente'] <= end_date)
        ]
    # Calcola il numero di incidenti nell'intervallo
    num_incidents = len(incidents_in_interval)

    # Aggiungi un dizionario ai dati risultanti
    result_data.append({
        'DataOraIncidente': end_date,
        'NumeroIncidenti': num_incidents
    })

result_data[-1]['End Date'] = pd.to_datetime('2022-12-31')

# Creare il DataFrame risultante
result_df = pd.DataFrame(result_data)

# Save the processed DataFrame
result_df.to_csv('dataset/processed/timeSeries/timeSeriesData2022.csv', header=True, index=False)