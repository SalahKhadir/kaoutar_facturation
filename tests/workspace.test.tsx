import { it, expect, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import Workspace from '../components/invoice/workspace';
it('ajoute et supprime les actes en conservant au moins une ligne', () => { render(<Workspace />); expect(screen.getAllByRole('textbox', { name: /Désignation/ })).toHaveLength(1); fireEvent.click(screen.getByRole('button', { name: 'Ajouter un acte' })); expect(screen.getAllByRole('textbox', { name: /Désignation/ })).toHaveLength(2); fireEvent.click(screen.getByRole('button', { name: 'Supprimer l’acte 2' })); expect(screen.getAllByRole('textbox', { name: /Désignation/ })).toHaveLength(1); expect((screen.getByRole('button', { name: 'Supprimer l’acte 1' }) as HTMLButtonElement).disabled).toBe(true); cleanup(); });

it('permet de saisir et réinitialiser les trois identifiants fiscaux',()=>{
    render(<Workspace/>);
    const fields=[screen.getByPlaceholderText("Saisir l'IF"),screen.getByPlaceholderText("Saisir l'ICE"),screen.getByPlaceholderText("Saisir l'INPE")];
    fields.forEach((field,i)=>{fireEvent.change(field,{target:{value:'000'+i}});expect((field as HTMLInputElement).value).toBe('000'+i);expect(field.getAttribute('type')).toBe('text');});
    const confirm=vi.spyOn(window,'confirm').mockReturnValue(true);
    fireEvent.click(screen.getByRole('button',{name:'Réinitialiser le formulaire'}));
    fields.forEach(field=>expect((field as HTMLInputElement).value).toBe(''));
    confirm.mockRestore();cleanup();
});
