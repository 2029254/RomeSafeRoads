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


# import the first csv file
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

# Group by date and count incidents for each date
incident_counts = dataset_rows.groupby(dataset_rows['DataOraIncidente'].dt.date).size().reset_index(name='NumeroIncidenti')

# Sort the DataFrame by date
incident_counts.sort_values(by='DataOraIncidente', inplace=True)

# Save the processed DataFrame
incident_counts.to_csv('dataset/processed/timeSeries/timeSeriesData2022Daily.csv', header=True, index=False)