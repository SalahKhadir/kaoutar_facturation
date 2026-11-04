import { it, expect } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import Workspace from '../components/invoice/workspace';
it('ajoute et supprime les actes en conservant au moins une ligne', () => { render(<Workspace />); expect(screen.getAllByRole('textbox', { name: /Désignation/ })).toHaveLength(1); fireEvent.click(screen.getByRole('button', { name: 'Ajouter un acte' })); expect(screen.getAllByRole('textbox', { name: /Désignation/ })).toHaveLength(2); fireEvent.click(screen.getByRole('button', { name: 'Supprimer l’acte 2' })); expect(screen.getAllByRole('textbox', { name: /Désignation/ })).toHaveLength(1); expect((screen.getByRole('button', { name: 'Supprimer l’acte 1' }) as HTMLButtonElement).disabled).toBe(true); cleanup(); });

it('affiche le format A5 et retire les identifiants éditables',()=>{
    render(<Workspace/>);
    expect(screen.getByText('A5 · PORTRAIT')).toBeTruthy();
    expect(screen.queryByRole('heading',{name:'Informations fiscales'})).toBeNull();
    expect(screen.queryByPlaceholderText("Saisir l'IF")).toBeNull();
    expect(screen.queryByPlaceholderText("Saisir l'ICE")).toBeNull();
    expect(screen.queryByPlaceholderText("Saisir l'INPE")).toBeNull();
    cleanup();
});
