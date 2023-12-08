import numpy as np
import pandas as pd
from matplotlib import pyplot as plt
from sklearn.decomposition import PCA
from sklearn import preprocessing
from sklearn.discriminant_analysis import StandardScaler

dataset = pd.read_csv('dataset/processed/scatterPlot/PCA-Data-2019.csv')
cols = ['QualitaFondoStradale', 'IntensitaTraffico', 'NUM_FERITI', 'NUM_MORTI', 'NUM_ILLESI', 'NUM_RISERVATA', 'Deceduto', 'DecedutoDopo', 'UtilizzoProtezioni']

# define standard scaler
scaler = StandardScaler()
# transform data
scaled = scaler.fit_transform(dataset[cols])

pca = PCA(n_components=2)
components = pca.fit_transform(scaled)
principal_components = pca.components_
df_components = pd.DataFrame(data=components, columns=['PC1', 'PC2'])

#aggiungo la colonna con l'indicazione di quale TipoVeicolo si tratta. Posso farlo perche la pca mantiene l'ordine delle righe
df_components['TipoVeicolo'] = dataset['TipoVeicolo']

df_components.to_csv('dataset/processed/scatterPlot/PCA-2019.csv', index=False)