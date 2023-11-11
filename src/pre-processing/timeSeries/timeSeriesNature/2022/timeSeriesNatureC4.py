import pandas as pd

# paths of csv files about 2022
csv = [
    'dataset/source/accidents-2022/02-Febbraio.csv',
    'dataset/source/accidents-2022/03-Marzo.csv',
    'dataset/source/accidents-2022/04-Aprile.csv',
    'dataset/source/accidents-2022/05-Maggio.csv',
    'dataset/source/accidents-2022/06-Giugno.csv',
    'dataset/source/accidents-2022/07-Luglio.csv',
    'dataset/source/accidents-2022/08-Agosto.csv'
]


# import the first csv file
dataset = pd.read_csv('dataset/source/accidents-2022/01-Gennaio.csv', sep=';', encoding='latin-1')


# import and concatenate all following csv files
for file in csv:
    dataset = pd.concat([dataset, pd.read_csv(file, sep=';', encoding='latin-1')], ignore_index=True)

# Select the columns of interest
columns = ['NaturaIncidente', 'Protocollo', 'DataOraIncidente']

dataset_columns = dataset[columns]

dataset_rows = dataset_columns.loc[dataset_columns['NaturaIncidente'].isin(['Tamponamento', 'Tamponamento Multiplo'])]

# Convert the 'DataOraIncidente' column to a datetime object
dataset_rows['DataOraIncidente'] = pd.to_datetime(dataset_rows['DataOraIncidente'], format='%d/%m/%Y %H:%M:%S',
                                                  errors='coerce')


# Drop duplicate Protocollo entries
dataset_rows.drop_duplicates(subset='Protocollo', keep='first', inplace=True)

dataset_rows.dropna(subset=['DataOraIncidente'], inplace=True)


# Define a function to round the date to the nearest 10 days
def round_date_to_10_days(date):
    day = 10
    month = date.month
    year = date.year
    if date == 1/1/2022:
        day = 1
    elif date.month == 12 and date.day >= 20:
        day = 1
        month = 1
        year = year + 1
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
incidenti_per_data.to_csv('dataset/processed/timeSeries/2022/timeSeriesNatureC4.csv', header=True, index=False)