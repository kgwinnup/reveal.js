FLAGS=--standalone -t revealjs --section-divs --template=libs/template.html --no-highlight

all: index.html

index.html: lyah.md
	pandoc -t $(FLAGS) markdown/test.md -o slides/test.html

