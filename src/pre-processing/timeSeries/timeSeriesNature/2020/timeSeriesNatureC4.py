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

dataset_rows = dataset_columns.loc[dataset_columns['NaturaIncidente'].isin(['Tamponamento', 'Tamponamento Multiplo'])]


# Convert the 'DataOraIncidente' column to a datetime object
dataset_rows['DataOraIncidente'] = pd.to_datetime(dataset_rows['DataOraIncidente'], format='%d/%m/%Y %H:%M:%S',
                                                  errors='coerce')

# Group by date and count incidents for each date
incident_counts = dataset_rows.groupby(dataset_rows['DataOraIncidente'].dt.date).size().reset_index(name='NumeroIncidenti')

# Sort the DataFrame by date
incident_counts.sort_values(by='DataOraIncidente', inplace=True)

# Save the processed DataFrame
incident_counts.to_csv('dataset/processed/timeSeries/2020/timeSeriesNatureC4.csv', header=True, index=False)
