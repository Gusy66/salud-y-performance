import sys
import os

try:
    import fitz  # PyMuPDF
    base_path = r"C:\Users\gusta\Documents\projetos\salud y performance"
    
    files = [f for f in os.listdir(base_path) if f.endswith('.pdf')]
    if files:
        pdf_file = None
        for f in files:
            if 'peptideos' in f.lower() and 'tabela' in f.lower():
                pdf_file = f
                break
        if not pdf_file and files:
            pdf_file = files[0]
        
        if pdf_file:
            pdf_path = os.path.join(base_path, pdf_file)
            doc = fitz.open(pdf_path)
            text = '\n'.join([page.get_text() for page in doc])
            print(text)
            doc.close()
        else:
            print("PDF não encontrado", file=sys.stderr)
            sys.exit(1)
    else:
        print("Nenhum PDF encontrado", file=sys.stderr)
        sys.exit(1)
except Exception as e:
    print(f"Erro: {e}", file=sys.stderr)
    sys.exit(1)
