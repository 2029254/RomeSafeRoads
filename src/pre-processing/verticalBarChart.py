import pandas

# paths of csv files about 2022
csv_2022 = [
    'dataset/source/accidents-2022/02-Febbraio.csv',
    'dataset/source/accidents-2022/03-Marzo.csv',
    'dataset/source/accidents-2022/04-Aprile.csv',
    'dataset/source/accidents-2022/05-Maggio.csv',
    'dataset/source/accidents-2022/06-Giugno.csv',
    'dataset/source/accidents-2022/07-Luglio.csv',
    'dataset/source/accidents-2022/08-Agosto.csv',
]

# import the first csv file
dataset = pandas.read_csv('dataset/source/accidents-2022/01-Gennaio.csv', sep=';', encoding='latin-1')

# import and concat all following csv files
for file in csv_2022:
    dataset = pandas.concat([dataset, pandas.read_csv(file, sep=';', encoding='latin-1')], ignore_index=True)

# select the columns of interest
columns = ['NaturaIncidente', 'Protocollo']
dataset_columns = dataset[columns]

# select the rows of interest
dataset_rows = dataset_columns

# group by NaturaIncidente and compute the number of accidents for each nature
processed_dataset = dataset_rows.groupby(['NaturaIncidente'])['Protocollo'].count()

# creation of dataframe (two-dimensional data structure) to organize a table with rows and columns
accidents_data_frame = pandas.DataFrame(processed_dataset)

# renames of columns
accidents_data_frame.rename(columns={"Protocollo": "NumeroIncidenti"}, inplace=True)

# export results in a new csv
accidents_data_frame.to_csv('dataset/processed/verticalBarChartData2022.csv', header=True)
