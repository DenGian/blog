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
                    An enthusiastic and detail-oriented Junior Full Stack Developer who can work either independently or as part of a team.
                    Eager and fast to learn new subjects efficiently under time pressure and adapts quickly.
                    Solution-driven professional focused on improving customer satisfaction and business processes.
                </p>
            </section>

            {/* Internship Section */}
            <section className="mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                    About My Internship
                </h2>
                <div className="bg-white rounded-lg shadow-lg p-8">
                    <div className="mb-8">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            HolonCom
                        </h3>
                        <p className="text-gray-600">
                            Beschrijving van het bedrijf.
                        </p>
                    </div>
                    <div className="mb-8">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            Junior Software Developer
                        </h3>
                        <p className="text-gray-600">
                            Beschrijving van de rol.
                        </p>
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            Technologies & Skills
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {['React', 'Next.js', 'TypeScript', 'MongoDB'].map((tech) => (
                                <span
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
                    About This Blog
                </h2>
                <div className="prose prose-lg max-w-none text-gray-600">
                    <p>
                        Dit blog dient als mijn portfolio en documentatie van mijn stage-ervaring.
                        Hier deel ik mijn leermomenten, uitdagingen en successen tijdens mijn stage.
                    </p>
                    <p className="mt-4">
                        Je vindt hier wekelijkse updates over:
                    </p>
                    <ul className="mt-4 space-y-2">
                        <li>Technische uitdagingen en oplossingen</li>
                        <li>Nieuwe technologieën en tools die ik leer</li>
                        <li>Projecten waaraan ik werk</li>
                        <li>Teamwork en bedrijfscultuur ervaringen</li>
                    </ul>
                </div>
            </section>
        </div>
    );
}