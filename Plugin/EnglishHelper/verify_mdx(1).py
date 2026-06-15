import os
import traceback
from readmdict import MDX

folder = r'H:\VCP\VCPzhangduan\VCPToolBox\Plugin\EnglishHelper\dicts\lm6'
mdx_files = [f for f in os.listdir(folder) if f.endswith('.mdx')]

if not mdx_files:
    print('No MDX file found in the directory!')
else:
    mdx_path = os.path.join(folder, mdx_files[0])
    print(f'Testing file: {mdx_files[0]}')
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