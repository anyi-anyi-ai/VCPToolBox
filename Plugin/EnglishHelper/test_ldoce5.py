import sys
import traceback
from readmdict import MDX

mdx_path = r'H:\VCP\VCPzhangduan\VCPToolBox\Plugin\EnglishHelper\dicts\lm6\LDOCE5++ V 2-15.mdx'
print(f"Testing new dictionary: {mdx_path}")

try:
    mdx = MDX(mdx_path)
    print('SUCCESS! MDX Loaded successfully.')
    print('Total items:', len(mdx))
    
    target = b'compromise'
    found = False
    for k, v in mdx.items():
        if k.lower() == target:
            print('Found test word: compromise')
            found = True
            break
            
    if not found:
        print('Test word not found, but dictionary loaded fine.')
except Exception as e:
    print('ERROR OCCURRED:')
    traceback.print_exc()