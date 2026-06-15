import sys
try:
    from mdict_utils.reader.mdict_reader import MDictReader
    mdx_path = r'H:\VCP\VCPzhangduan\VCPToolBox\Plugin\EnglishHelper\dicts\lm6\朗文当代高级英语辞典6th.mdx'
    reader = MDictReader(mdx_path)
    res = reader.query('compromise')
    if res:
        print('SUCCESS! Found results:', len(res))
        print('Preview:', str(res)[:800])
    else:
        print('NOT FOUND in MDX')
except Exception as e:
    print('ERROR:', e)