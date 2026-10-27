const Header = ({ title }: { title: string }) => {
    return (
        <header>
            <h1>{title}</h1>
            <p className="header-subtitle">
                Start by asserting your role first. You can then view the list of users aligned with your role.
            </p>
        </header>
    );
};
export default Header;
