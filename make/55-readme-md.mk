README_MD:=README.md
README_MD_SRC:=$(shell find $(SRC)/docs -name "*.md") $(SDLC_ALL_NON_TEST_JS_FILES_SRC)
BUILD_TARGETS+=$(README_MD)

$(README_MD): $(README_MD_SRC)
	cp $(SRC)/docs/README.01.md $@
	npx jsdoc2md \
	  --configure ./jsdoc.config.json \
	  --files 'src/**/*' \
	  --global-index-format grouped \
	  --name-format \
	  --plugin dmd-readme-api \
	  --plugin @liquid-labs/dmd \
	  --clever-links \
	  --no-cache \
	  >> $@
	cat $(SRC)/docs/README.02.md >> $@