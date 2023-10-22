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

dataset_rows = dataset_columns.loc[dataset_columns['NaturaIncidente'].isin(['Investimento di pedone'])]

# Convert the 'DataOraIncidente' column to a datetime object
dataset_rows['DataOraIncidente'] = pd.to_datetime(dataset_rows['DataOraIncidente'], format='%d/%m/%Y %H:%M:%S',
                                                  errors='coerce')
print(dataset_rows)


# Drop duplicate Protocollo entries
dataset_rows.drop_duplicates(subset='Protocollo', keep='first', inplace=True)

print(dataset_rows.dropna(subset=['DataOraIncidente'], inplace=True))
dataset_rows.dropna(subset=['DataOraIncidente'], inplace=True)


# Define a function to round the date to the nearest 10 days
def round_date_to_10_days(date):
    day = 10
    month = date.month
    year = date.year
    if date == 1/1/2020:
        day = 1
    elif date.day < 10:
        day = 10
    elif date.day < 20:
        day = 20
    elif date.day > 20 and date.month < 12:
        day = 1
        month = month + 1
    else:
        day = 1
        month = month
    return pd.to_datetime(f"{day}/{month}/{year}", format='%d/%m/%Y')


# Apply the function to round the date
dataset_rows['DataOraIncidente'] = dataset_rows['DataOraIncidente'].apply(round_date_to_10_days)

incidenti_per_data = dataset_rows.groupby('DataOraIncidente').size().reset_index(name='NumeroIncidenti')

# Save the processed DataFrame
incidenti_per_data.to_csv('dataset/processed/timeSeries/timeSeriesData2020.csv', header=True, index=False)
