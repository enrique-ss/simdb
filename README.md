# Kindred

Catalogador & Match Social de Mídias

## 🚀 Como Rodar (Do Zero)

### Pré-requisitos
- **VS Code** - [Download aqui](https://code.visualstudio.com/)
- **Node.js** (versão 18 ou superior) - [Download aqui](https://nodejs.org/)

### Passo a Passo

1. **Abra o projeto no VS Code**
   ```bash
   # Navegue até a pasta do projeto
   cd kindred
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure o projeto**
   ```bash
   npm run setup
   ```

4. **Inicie o servidor de desenvolvimento**
   ```bash
   npm run dev
   ```

5. **Abra no navegador**
   - O servidor estará rodando em: `http://localhost:3000`
   - Abra este endereço no seu navegador

## 🧪 Como Testar

### Testes Locais
- Acesse `http://localhost:3000` no navegador
- Teste as funcionalidades principais:
  - Login/Cadastro
  - Busca de mídias
  - Adicionar ao continuar
  - Avaliar mídias
  - Perfil e configurações

### Estrutura do Projeto
- `public/` - Arquivos estáticos (HTML, CSS, JS)
- `server/` - Backend Node.js
- `package.json` - Dependências e scripts

## 📝 Scripts Disponíveis

- `npm install` - Instala dependências
- `npm run setup` - Configura o projeto
- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Build para produção
- `npm run start` - Inicia servidor de produção

## 🐛 Problemas Comuns

### Porta 3000 em uso
Se a porta 3000 estiver ocupada, o servidor usará automaticamente a próxima disponível (3001, 3002, etc).

### Erro de dependências
Se tiver problemas com dependências, tente:
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📄 Licença
MIT
