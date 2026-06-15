import sys
import traceback

try:
    from readmdict import MDX
    mdx_path = r'H:\VCP\VCPzhangduan\VCPToolBox\Plugin\EnglishHelper\dicts\lm6\朗文当代高级英语辞典6th.mdx'
    print("Loading MDX file (this might take a few seconds)...")
    mdx = MDX(mdx_path)
    print("MDX Loaded! Total items:", len(mdx))
    
    target = b'compromise'
    print("Searching for 'compromise'...")
    
    found = False
    for k, v in mdx.items():
        if k.lower() == target:
            print("SUCCESS! Found the word.")
            print("Preview HTML:")
            print(v.decode('utf-8', errors='ignore')[:800])
            found = True
            break
            
    if not found:
        print("NOT FOUND in MDX")
        
except Exception as e:
    print("ERROR OCCURRED:")
    traceback.print_exc()