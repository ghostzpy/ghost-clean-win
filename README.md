# Gosth Clean

Aplicativo de limpeza para Windows desenvolvido em Electron.

Remove arquivos temporários, executa `sfc /scannow` e limpa a lixeira com apenas um clique.

## Funcionalidades
- Limpeza automática das pastas: `%temp%`, `prefetch`, `Temp`
- Execução visual do comando `sfc /scannow`
- Controle personalizável de transparência
- Interface inspirada no estilo "Matrix"

---

## Instalação e Execução

Siga os passos abaixo para instalar e executar o aplicativo:

### 1. Instalar o Node.js

Caso ainda não tenha instalado o Node.js:

- Acesse [nodejs.org](https://nodejs.org) e baixe a versão LTS.
- Execute o instalador e siga as instruções.
- Verifique a instalação abrindo o Prompt de Comando ou PowerShell e digitando:

```bash
node -v
```

### 2. Clonar o repositório

Clone o projeto diretamente do GitHub:

```bash
git clone https://github.com/ghostzpy/ghost-clean-win.git
cd ghost-clean-win
```

### 3. Instalar dependências

No diretório clonado, instale as dependências necessárias com o comando:

```bash
npm install
```

### 4. Executar o projeto

Inicie o aplicativo com o Electron:

```bash
npm start
```

**Agora o aplicativo está pronto para ser usado!**