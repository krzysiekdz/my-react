Wirtualny element to obiekt, ktory posiada wszelkie informacje na podstawie ktorych mozna stworzyc obiekt DOM; obiekt DOM jest duzy, np dwa paragrafy to duze obiekty a moga sie różnić jedynie tekstem w sobie; obiekt wirtualny paragrafu zawierałby w takim razie jedynie tekst - dzieki temu jestemy w stanie szybciej sprawdzic czym dane elementy siê róznią; 
jesli elementy się róznia to wtedy odswiezamy element DOM z jakim jest powiazany wirulany element 
są: wirutalne elementy, elementy (DOM - tworzone z wirtulanych elementow); wirtualny element tekstowy i odpowiadajacy mu wezel tekstowy; komponent wirtualny (czyli lekka wersja) oraz komponenty (czyli taka ciezka wersja )
komponent wirtualny jest normlanie przechowywany w drzewie - do tego sluzy i rowniez ma wszystkie informacje aby zbudowac komponent prawdziwy;
komponent prawdziwy jest przechowywany w wirutlanym jako referencja; komponent prawdziwy tworzy (render()) element wirtualny ktory jest montowany w dom (ale w tym etapie w jakim jestem, tworzony przez komponent element wirutlany nie jest dodawany do drzewa elementow wirtualnych - to jest blad chyba)
dzieckiem elementu / komponentu moze byc tekst - i nie musi byc tablica - wtedy jesli to tekst, to taki element zawiera w sobie jedynie tekst, bez dzieci

!! kazde sprawdzanie drzew to utworzenie nowego drzewa i porownanie ze starym - trzeba wiec przypisac odpowiednie wezly DOM do nowego drzewa wirulanego, zeby odpowiadalo ono staremu!!
nastepnie sprawdzamy fragmenty dzrewa i tam gdzie sa roznice to aktualizujemy, bez tworzenia juz nowych elementow DOM

za kazdym setState zapisujemy jakby stan aplikacji w polu currentElement - niezlaeznie czy byla zmiana czy nie, nowy renderujemy nowe drzewo dla sprawdzenia czy byla, wiec i tak zawsze pameitamy nowe - teraz jest problem, bo przy montowaniu wpisywalismy pewne rzeczy, ktorych potem przy funkcji render juz nie ma - nalezy je dodac wlasnie w updateComponent, zeby ten kolejny byl dalej aktulany

miałem błąd polegajacy na tym, ze komponent nie odswiezał sie, gdy był dzieckiem; bład polegał na tym, ze renderujac nowy komponent w updateComponent, propsy były nadal stare, bo byly zainicjalizowane jedynie na poczatku przy tworzeniu - nalezy kazdorazowo przekazywac nowe propsy do komponentu, aby wygenerowal nowe drzewo wirtualne

komponenty generuja drzewa wirtualne; komponent moze takze byc w drzewie wirtualnym

gdy komponent zmienia stan, to jest renderowany od nowa i sprawdzany pod wzgledem zmian - renderowanie od nowa polega na renderowaniu drzew wirtulanych i sprawdzaniu ich pól; jesli jest zmiana, to wtedy dany fragment tylko jest odswiezany, nie sa tworzone zadne nowe elementy; stan moze byc przekazywany komponentom ni¿ej poprezz propsy -> dlatego tez kazdy komponent przy update, musi dostarczyc nowe propsy gdy renderuje nowe wirtulane drzewo do porównania go ze starym

w updateVComponent nie moge uzyc updateComponent, bo w updateComponent aktualizujê state od this._pendingState, ktory nadpisze mi po prostu aktulany state -> nalezy przepisac czesc kodu po prostu do udpateVComponent i juz (dopiero setState ustawia pendingState i wtedy dopiero mozna uzyc updateComponent)


stan działa tak, ze gdy zajdzie w nim zmiana, to renderujemy ponownie komponent (i jemu podlegle) - tworzymy po prostu nowe drzewo wirtualne; metoda setState uruchamiamy mechanizm sprawdzania dzrewa wirtualnego dla komponentu, ktoremu stan sie zmienil - co ciekawe, nie sprawdzamy stanu, ale elementy w drzewie ktore zmienily sie pod wplywem zmiany stanu

metodę render traktowac jako metodê ktora updateuje komponent - jest ona bowiem wywolywana zawsze gdy sprawdzamy aktualny stan komponentu - pobiera ona wtedy aktualne wartosci state i props i renderuje nowa zawartosc (tzn elementy wirtualne); te wirualne drzewo jest wtedy porownwywane z ostatnim aktualnym - gdy jakies wartosc sa niekatulne, drzewo DOM jest aktualizowane

patrzec na render jako metode aktualizującą

jesli gdzieś robię aktuliazcję stanu:
	selectItem(item) {
    	this.setState({selectedItem: item});
    }
to robi siê render:
	render() {
		const {data, selectedItem} = this.state;
		return (
			<div className="container">
				<Menu 
					createRows={this.createRows.bind(this)}
				></Menu>
				<List items={data}></List>
			</div>
		);
	}
w render pobierane sa wszystkie wartosci, m.in. ta nowo zaktulaizowana; wiadomo, ze gdzies w glebi drzewa komponentow musi byc u¿yta ta wartosc by generowac jakis element - przy porownnaiu drzew wirtualnych wyjdzie gdzie zosta³a uzyta i ten fragment bedzie zaktuliazowany na faktyczym drzewie DOM, a byc moze zajdzie tez potrzeba generowania nowych elementow DOM (jesli cos zostalo dodane)