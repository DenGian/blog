import Link from 'next/link';

export default function AboutPage() {
    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Profile Section */}
            <section className="mb-16 text-center">
                <div className="mb-8">
                    <img
                        src="/profile-image.jpg"
                        alt="Ian Mondelaers"
                        className="w-40 h-40 rounded-full mx-auto object-cover"
                    />
                </div>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    Ian Mondelaers
                </h1>
                <div className="flex justify-center gap-4 mb-6">
                    <Link
                        href="https://www.linkedin.com/in/ian-mondelaers/"
                        target="_blank"
                        className="text-blue-600 hover:text-blue-800"
                    >
                        LinkedIn
                    </Link>
                    <Link
                        href="https://github.com/DenGian"
                        target="_blank"
                        className="text-gray-600 hover:text-gray-800"
                    >
                        GitHub
                    </Link>
                </div>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Een enthousiaste en detailgerichte Junior Full Stack Developer die zowel zelfstandig als in teamverband effectief kan werken. Ik leer snel en efficiënt nieuwe onderwerpen, zelfs onder tijdsdruk, en pas me vlot aan veranderende situaties aan. Als oplossingsgerichte professional streef ik ernaar de klanttevredenheid en bedrijfsprocessen continu te verbeteren.
                </p>
            </section>

            {/* Internship Section */}
            <section className="mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                    Over mijn stage
                </h2>
                <div className="bg-white rounded-lg shadow-lg p-8">
                    <div className="mb-8">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            HolonCom
                        </h3>
                        <p className="text-gray-600">
                            HolonCom biedt eenvoudige en betrouwbare IT-oplossingen voor professionals, waaronder all-in IT-support, cybersecurity, telefonie, webontwikkeling en softwareontwikkeling. Ze focussen op gebruiksvriendelijke en veilige technologieën, met vaste prijzen per gebruiker en device. Hun diensten helpen bedrijven efficiënter te werken met oplossingen zoals MyDesk (virtuele desktops), FileWallet (documentbeheer) en maatwerksoftware. HolonCom streeft naar directe en persoonlijke ondersteuning, zonder ingewikkelde helpdesks.
                        </p>
                    </div>
                    <div className="mb-8">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            Junior Software Developer
                        </h3>
                        <p className="text-gray-600">
                            Als Junior Software Engineer bij HolonCom draag ik actief bij aan de softwareontwikkeling en het verbeteren van interne processen. Mijn taken omvatten het refactoren van bestaande code, het ontwikkelen en beheren van NuGet packages voor herbruikbare componenten, en het automatiseren van deployment pipelines (CI/CD). Ik werk voornamelijk in C# (.NET) en ben verantwoordelijk voor het schrijven van unit tests om de kwaliteit te waarborgen. Daarnaast los ik complexe technische problemen op en documenteer ik mijn werk om de kennisdeling te bevorderen. Ik werk actief aan het efficiënter maken van de softwarelevering van HolonCom.
                        </p>
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            Technologies & Skills
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {['C#', '.Net', 'CI/CD', 'NuGet', 'Docker', 'Git', 'Unit Tests (xUnit)', 'Gitea', 'Debugging', 'Problem analysis'].map((tech) => (                                <span
                                    key={tech}
                                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full"
                                >
                                    {tech}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Blog Purpose Section */}
            <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                    Over deze blog
                </h2>
                <div className="prose prose-lg max-w-none text-gray-600">
                    <p>
                        Welkom op mijn persoonlijke stageblog! Dit is meer dan zomaar een portfolio; het is mijn digitale logboek van een intensieve en leerzame periode als Junior Software Engineer bij HolonCom. Hier neem ik je mee achter de schermen van mijn dagelijkse avonturen in de IT-wereld, vol met code, uitdagingen en doorbraken.
                    </p>
                    <p className="mt-4">
                        Ik deel wekelijkse updates over:
                    </p>
                    <ul className="mt-4 space-y-2">
                        <li>Complexe technische vraagstukken: Van het temmen van null-references en caching issues tot het automatiseren van NuGet deployments en het opzetten van CI/CD pijplijnen met Gitea Actions. Ik beschrijf hoe ik deze problemen aanpak en de oplossingen die ik vond.</li>
                        <li>De duik in nieuwe technologieën: Een ontdekkingstocht langs talen en tools zoals C# en .NET, de ins en outs van Git en Gitea, en zelfs het experimenteren met AI-tools zoals Cursor en de ontwikkeling van een eigen VS Code extensie.</li>
                        <li>Mijn projecten bij HolonCom: Van het optimaliseren van applicaties, Unit Testing en Code Refactoring tot het bouwen van herbruikbare NuGet packages voor klantprojecten.</li>
                        <li>Persoonlijke en professionele groei: de open cultuur van HolonCom die ruimte biedt voor persoonlijke reflectie en het leren omgaan met uitdagingen en fouten.</li>
                    </ul>
                </div>
            </section>
        </div>
    );
}