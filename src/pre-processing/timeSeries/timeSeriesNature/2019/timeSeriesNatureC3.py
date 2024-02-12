import pandas as pd

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
dataset_2019 = pd.read_csv('dataset/source/accidents-2019/01-Gennaio.csv', sep=';', encoding='latin-1')


# import and concatenate all following csv files
for file in csv_2019:
    dataset_2019 = pd.concat([dataset_2019, pd.read_csv(file, sep=';', encoding='latin-1')], ignore_index=True)

# Select the columns of interest
columns = ['NaturaIncidente', 'Protocollo', 'DataOraIncidente']

dataset_columns = dataset_2019[columns]

dataset_rows = dataset_columns.loc[dataset_columns['NaturaIncidente'].isin(['Veicolo in marcia contro veicolo in sosta', 'Veicolo in marcia contro veicolo fermo', 'Veicolo in marcia contro veicolo arresto'])]


# Convert the 'DataOraIncidente' column to a datetime object
dataset_rows['DataOraIncidente'] = pd.to_datetime(dataset_rows['DataOraIncidente'], format='%d/%m/%Y %H:%M:%S',
                                                  errors='coerce')

# Group by date and count incidents for each date
incident_counts = dataset_rows.groupby(dataset_rows['DataOraIncidente'].dt.date).size().reset_index(name='NumeroIncidenti')

# Sort the DataFrame by date
incident_counts.sort_values(by='DataOraIncidente', inplace=True)

# Save the processed DataFrame
incident_counts.to_csv('dataset/processed/timeSeries/2019/timeSeriesNatureC3.csv', header=True, index=False)

