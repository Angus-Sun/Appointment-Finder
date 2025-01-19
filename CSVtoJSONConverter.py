import pandas as pd

df = pd.read_csv('Data/parent_interviews_test_data(in).csv')

df.to_json('data.json', orient = 'records')