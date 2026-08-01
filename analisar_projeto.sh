#!/bin/bash

echo "📁 ANALISANDO PROJETO STREAMVAULT..."
echo "=====================================" > projeto_completo.txt
echo "📁 ESTRUTURA COMPLETA:" >> projeto_completo.txt
echo "" >> projeto_completo.txt

# Estrutura de pastas
tree -L 5 --prune -I "node_modules|.next|dist|build|__pycache__" >> projeto_completo.txt 2>/dev/null

echo "" >> projeto_completo.txt
echo "=====================================" >> projeto_completo.txt
echo "📝 ARQUIVOS IMPORTANTES:" >> projeto_completo.txt
echo "" >> projeto_completo.txt

# Listar todos os arquivos .ts, .tsx, .js, .jsx
find src -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.css" -o -name "*.json" \) ! -path "*/node_modules/*" ! -path "*/.next/*" | while read arquivo; do
    echo "" >> projeto_completo.txt
    echo "📄 $arquivo" >> projeto_completo.txt
    echo "----------------------------------------" >> projeto_completo.txt
    cat "$arquivo" >> projeto_completo.txt 2>/dev/null
    echo "" >> projeto_completo.txt
done

echo "" >> projeto_completo.txt
echo "=====================================" >> projeto_completo.txt
echo "✅ ANÁLISE CONCLUÍDA!" >> projeto_completo.txt
echo "📊 Arquivos listados: $(find src -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) ! -path "*/node_modules/*" ! -path "*/.next/*" | wc -l)" >> projeto_completo.txt

echo "✅ Arquivo gerado: projeto_completo.txt"
echo "📊 Tamanho: $(du -h projeto_completo.txt 2>/dev/null | cut -f1)"
