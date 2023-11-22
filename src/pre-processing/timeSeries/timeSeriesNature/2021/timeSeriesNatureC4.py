import pandas as pd

# paths of csv files about 2021
csv_2021 = [
    'dataset/source/accidents-2021/02-Febbraio.csv',
    'dataset/source/accidents-2021/03-Marzo.csv',
    'dataset/source/accidents-2021/04-Aprile.csv',
    'dataset/source/accidents-2021/05-Maggio.csv',
    'dataset/source/accidents-2021/06-Giugno.csv',
    'dataset/source/accidents-2021/07-Luglio.csv',
    'dataset/source/accidents-2021/08-Agosto.csv',
    'dataset/source/accidents-2021/09-Settembre.csv',
    'dataset/source/accidents-2021/10-Ottobre.csv',
    'dataset/source/accidents-2021/11-Novembre.csv',
    'dataset/source/accidents-2021/12-Dicembre.csv'
]

# import the first csv file
dataset_2021 = pd.read_csv('dataset/source/accidents-2021/01-Gennaio.csv', sep=';', encoding='latin-1')


# import and concatenate all following csv files
for file in csv_2021:
    dataset_2021 = pd.concat([dataset_2021, pd.read_csv(file, sep=';', encoding='latin-1')], ignore_index=True)

# Select the columns of interest
columns = ['NaturaIncidente', 'Protocollo', 'DataOraIncidente']

dataset_columns = dataset_2021[columns]

dataset_rows = dataset_columns.loc[dataset_columns['NaturaIncidente'].isin(['Tamponamento', 'Tamponamento Multiplo'])]


# Convert the 'DataOraIncidente' column to a datetime object
dataset_rows['DataOraIncidente'] = pd.to_datetime(dataset_rows['DataOraIncidente'], format='%d/%m/%Y %H:%M:%S',
                                                  errors='coerce')


# Drop duplicate Protocollo entries
dataset_rows.drop_duplicates(subset='Protocollo', keep='first', inplace=True)

dataset_rows.dropna(subset=['DataOraIncidente'], inplace=True)


# Creare una lista di dizionari contenenti i dati
result_data = []

# Aggiungi il conteggio per il 1 gennaio separatamente
start_date = pd.to_datetime('2021-01-02')
incidents_on_jan_1 = dataset_rows[
    (dataset_rows['DataOraIncidente'] < start_date)
]
num_incidents_on_jan_1 = len(incidents_on_jan_1)

result_data.append({
    'DataOraIncidente':  pd.to_datetime('2021-01-01'),
    'NumeroIncidenti': num_incidents_on_jan_1
})

# Date range da 1 gennaio 2021 a 31 dicembre 2021, con intervallo di 10 giorni
date_range = pd.date_range(start='2021-01-01', end='2021-12-31', freq='10D')

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

result_data[-1]['End Date'] = pd.to_datetime('2021-12-31')

# Creare il DataFrame risultante
result_df = pd.DataFrame(result_data)

# Save the processed DataFrame
result_df.to_csv('dataset/processed/timeSeries/2021/timeSeriesNatureC4.csv', header=True, index=False)
